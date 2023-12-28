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

async function main() {
  const [, wallet2] = await ethers.getSigners();
  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    wallet2
  );

  const perps = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const spot = (network.config as CopinNetworkConfig).SNX_SPOT_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, wallet2);
  const spotMarket = new ethers.Contract(spot, spotMarketAbi, wallet2);

  const position = await perpsMarket.getOpenPosition(
    BigNumber.from("170141183460469231731687303715884106886"),
    100
  );
  console.log(
    "position",
    Object.entries(position).map(([key, value]: any[]) => ({
      [key]: ethers.utils.formatEther(value),
    }))
  );
  console.log(
    await copytrade.getAccountTrading("170141183460469231731687303715884106886")
  );
  console.log((await copytrade.getKeyAccount(wallet2.address, 100)).toString());
  // const order = await perpsMarket.getOrder(
  //   BigNumber.from("170141183460469231731687303715884106884")
  // );
  // console.log(
  //   "order",
  //   Object.entries(order).map(([key, value]: any[]) => ({
  //     [key]: value.toString(),
  //   }))
  // );
  const availableMargin = await perpsMarket.getAvailableMargin(
    BigNumber.from("170141183460469231731687303715884106886")
  );
  console.log(ethers.utils.formatEther(availableMargin));
}
main();
