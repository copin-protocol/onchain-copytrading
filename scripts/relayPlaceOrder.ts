import { formatEther, parseEther } from "@ethersproject/units";
import { Defender } from "@openzeppelin/defender-sdk";
import { ethers, network } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import { abi as mockERC20 } from "../artifacts/contracts/test/MockERC20.sol/MockERC20.json";
import {
  Command,
  RELAYER_API_KEY,
  RELAYER_API_SECRET,
  SMART_COPYTRADE_ADDRESS,
} from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";
import perpsMarketAbi from "../utils/abis/perpsMarketAbi";
import spotMarketAbi from "../utils/abis/spotMarketAbi";
import { BigNumber } from "ethers";
import { calculateAcceptablePrice } from "../utils/perps";
// const { formatUnits } = require("ethers/lib/utils");

const abiDecoder = ethers.utils.defaultAbiCoder;

const ethMarketId = 100;

async function main() {
  const credentials = {
    relayerApiKey: RELAYER_API_KEY,
    relayerApiSecret: RELAYER_API_SECRET,
  };
  const client = new Defender(credentials);

  const provider = client.relaySigner.getProvider();
  // const config = network.config as CopinNetworkConfig;
  // const nodeURL = config.url;
  // const provider = new JsonRpcProvider(nodeURL);
  // const signer: any = new ethers.Wallet(process.env.PRIVATE_KEY_3!, provider);

  const signer = client.relaySigner.getSigner(provider, {
    speed: "fast",
    validForSeconds: 120,
  });

  const [, demoSource] = await ethers.getSigners();
  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    signer as any
  );

  const perps = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  const indexPrice = await perpsMarket.indexPrice(ethMarketId);

  const leverage = 10;
  const amount = ethers.utils.parseEther("100");
  const isLong = true;
  const isIncrease = true;
  const sign = isLong === isIncrease ? 1 : -1;
  // const sign = -1;
  const sizeDelta = amount
    .mul(leverage)
    .mul(BigNumber.from(10).pow(18))
    .div(indexPrice)
    .mul(sign);

  const commands: Command[] = [];
  const inputs: (string | number)[] = [];

  // get account allocated for source trader address + market address
  const accountId = await copytrade.allocatedAccount(
    demoSource.address,
    ethMarketId,
    false
  );

  let totalAmount = amount;

  if (accountId.eq(0)) {
    commands.push(Command.PERP_CREATE_ACCOUNT, Command.PERP_MODIFY_COLLATERAL);
    inputs.push(
      0,
      abiDecoder.encode(
        ["address", "uint256", "int256"],
        [demoSource.address, ethMarketId, totalAmount]
      )
    );
  } else {
    // const size = TOTAL_MARGIN.mul(BigNumber.from(10).pow(18)).div(indexPrice);

    const position = await perpsMarket.getOpenPosition(accountId, ethMarketId);
    if (!position.positionSize.eq(0)) {
      console.log("aaaa");
      totalAmount = (position.positionSize as BigNumber)
        .add(sizeDelta)
        .div(leverage)
        .mul(indexPrice)
        .div(BigNumber.from(10).pow(18))
        .abs();
    }
    const availableMargin: BigNumber = await perpsMarket.getAvailableMargin(
      accountId
    );
    const ONE = BigNumber.from(10).pow(18);
    const withdrawableMargin: BigNumber = (
      await perpsMarket.getWithdrawableMargin(accountId)
    ).sub(ONE); // 1 SUSD safety
    const diff = availableMargin
      .sub(totalAmount)
      .abs()
      .mul(ONE)
      .div(totalAmount);

    if (diff.gt(ONE.div(100))) {
      const diffAmount = totalAmount.sub(availableMargin);
      console.log("diffAmount", formatEther(diffAmount));
      commands.push(Command.PERP_MODIFY_COLLATERAL);
      let modifyAmount: BigNumber = BigNumber.from(0);
      if (diffAmount.gt(0)) {
        modifyAmount = diffAmount;
      } else if (withdrawableMargin.gt(0)) {
        modifyAmount = withdrawableMargin.gt(diffAmount.abs())
          ? diffAmount
          : withdrawableMargin.mul(-1);
      }
      if (!modifyAmount.eq(0)) {
        console.log("modifyAmount", formatEther(modifyAmount));
        inputs.push(
          abiDecoder.encode(
            ["address", "uint256", "int256"],
            [demoSource.address, ethMarketId, modifyAmount]
          )
        );
      }
    }
  }

  const fillPrice = await perpsMarket.fillPrice(
    ethMarketId,
    sizeDelta,
    indexPrice
  );

  console.log("accountId", accountId.toString());
  console.log("indexPrice", formatEther(indexPrice));
  console.log("fillPrice", formatEther(fillPrice));
  console.log("sizeDelta", formatEther(sizeDelta));
  console.log("amount", formatEther(amount));
  console.log("totalAmount", formatEther(totalAmount));

  commands.push(Command.PERP_PLACE_ORDER);
  inputs.push(
    abiDecoder.encode(
      ["address", "uint256", "int256", "uint256", "address"],
      [
        demoSource.address,
        ethMarketId,
        sizeDelta,
        calculateAcceptablePrice(fillPrice, sizeDelta),
        demoSource.address,
      ]
    )
  );

  console.log("commands", commands);
  const tx = await copytrade.execute(commands, inputs, {
    gasLimit: commands.length * 1_000_000,
  });
  console.log("tx", tx);
}
main();
