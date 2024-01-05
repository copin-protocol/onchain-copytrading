import { formatEther, parseEther } from "@ethersproject/units";
// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import { abi as mockERC20 } from "../artifacts/contracts/test/MockERC20.sol/MockERC20.json";
import { Command, SMART_COPYTRADE_ADDRESS } from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";
import perpsMarketAbi from "../utils/abis/perpsMarketAbi";
import spotMarketAbi from "../utils/abis/spotMarketAbi";
import { BigNumber } from "ethers";
// const { formatUnits } = require("ethers/lib/utils");

export const DEFAULT_MARGIN = ethers.utils.parseEther("100");

const abiDecoder = ethers.utils.defaultAbiCoder;

const ethMarketId = 100;

async function main() {
  const [, demoSource] = await ethers.getSigners();
  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    demoSource as any
  );

  const perps = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(
    perps,
    perpsMarketAbi,
    demoSource as any
  );

  // const accountId = BigNumber.from("170141183460469231731687303715884106886");
  // const accountId = BigNumber.from("170141183460469231731687303715884106887");
  // console.log("trading", await copytrade.getAccountTrading(accountId));
  // console.log(
  //   (await copytrade.getKeyAccount(demoSource.address, ethMarketId)).toString()
  // );
  const accountId = await copytrade.allocatedAccount(
    demoSource.address,
    ethMarketId,
    false
  );
  console.log("accountId", accountId.toString());

  const indexPrice = await perpsMarket.indexPrice(ethMarketId);

  console.log("indexPrice", ethers.utils.formatEther(indexPrice));

  const position = await perpsMarket.getOpenPosition(accountId, ethMarketId);
  console.log(
    "position",
    Object.entries(position).map(([key, value]: any[]) => ({
      [key]: ethers.utils.formatEther(value),
    }))
  );
  const order = await perpsMarket.getOrder(accountId);
  console.log("order", order);
  const availableMargin = await perpsMarket.getAvailableMargin(accountId);
  console.log("availableMargin", ethers.utils.formatEther(availableMargin));
  const withdrawableMargin = await perpsMarket.getWithdrawableMargin(accountId);
  console.log(
    "withdrawableMargin",
    ethers.utils.formatEther(withdrawableMargin)
  );
}
main();
