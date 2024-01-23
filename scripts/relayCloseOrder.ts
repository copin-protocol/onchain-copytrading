import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import {
  Command,
  MARKET_IDS,
  SMART_COPYTRADE_ADDRESS,
} from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";
import perpsMarketAbi from "../utils/abis/perpsMarketAbi";
import { calculateAcceptablePrice } from "../utils/perps";
import { getRelaySigner } from "../utils/relay";

const abiDecoder = ethers.utils.defaultAbiCoder;

async function main() {
  const signer = getRelaySigner();

  const demoSource = {
    address: SMART_COPYTRADE_ADDRESS,
    // address: "0x1aA25aBC0f3A29d017638ec9Ba02668921F91016",
  };

  const copytrade = new ethers.Contract(
    // SMART_COPYTRADE_ADDRESS,
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    signer as any
  );

  const perps = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  const indexPrice = await perpsMarket.indexPrice(MARKET_IDS.ETH);
  const commands: Command[] = [];
  const inputs: string[] = [];

  // get account allocated for source trader address + market address
  const accountId = await copytrade.getAllocatedAccount(
    demoSource.address,
    MARKET_IDS.ETH
  );

  if (accountId.eq(0)) {
    throw Error("Position not found");
  }

  const position = await perpsMarket.getOpenPosition(accountId, MARKET_IDS.ETH);
  if (position.positionSize.eq(0)) {
    throw Error("No open position");
  }
  const sizeDelta = position.positionSize.mul(-1);
  // const ONE = BigNumber.from(10).pow(18);
  // const withdrawableMargin: BigNumber = (
  //   await perpsMarket.getWithdrawableMargin(accountId)
  // ).sub(ONE); // 1 SUSD safety

  // if (withdrawableMargin.gt(0)) {
  //   commands.push(Command.PERP_MODIFY_COLLATERAL);
  //   inputs.push(
  //     abiDecoder.encode(
  //       ["address", "uint256", "int256"],
  //       [demoSource.address, ethMarketId, withdrawableMargin.mul(-1)]
  //     )
  //   );
  // }

  const fillPrice = await perpsMarket.fillPrice(
    MARKET_IDS.ETH,
    sizeDelta,
    indexPrice
  );

  console.log("accountId", accountId.toString());
  console.log("indexPrice", formatEther(indexPrice));
  console.log("fillPrice", formatEther(fillPrice));
  console.log("sizeDelta", formatEther(sizeDelta));

  commands.push(Command.PERP_CLOSE_ORDER);
  inputs.push(
    abiDecoder.encode(
      ["address", "uint256", "uint256", "address"],
      [
        demoSource.address,
        MARKET_IDS.ETH,
        calculateAcceptablePrice(fillPrice, sizeDelta),
        demoSource.address,
      ]
    )
  );

  console.log("commands", commands);
  const tx = await copytrade.execute(commands, inputs, {
    gasLimit: 2_000_000,
  });
  console.log("tx", tx);
}
main();
