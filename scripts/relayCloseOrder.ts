import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import { Command, SMART_COPYTRADE_ADDRESS } from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";
import perpsMarketAbi from "../utils/abis/perpsMarketAbi";
import { calculateAcceptablePrice } from "../utils/perps";
import { getRelaySigner } from "../utils/relay";

const abiDecoder = ethers.utils.defaultAbiCoder;

const ethMarketId = 200;

async function main() {
  const signer = getRelaySigner();

  const demoSource = {
    address: SMART_COPYTRADE_ADDRESS,
  };

  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    signer as any
  );

  const perps = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  const indexPrice = await perpsMarket.indexPrice(ethMarketId);
  const commands: Command[] = [];
  const inputs: string[] = [];

  // get account allocated for source trader address + market address
  const accountId = await copytrade.getAllocatedAccount(
    demoSource.address,
    ethMarketId
  );

  if (accountId.eq(0)) {
    throw Error("Position not found");
  }

  const position = await perpsMarket.getOpenPosition(accountId, ethMarketId);
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
    ethMarketId,
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
        ethMarketId,
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
