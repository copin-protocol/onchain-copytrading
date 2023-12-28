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
import { calculateAcceptablePrice } from "../utils/perps";
// const { formatUnits } = require("ethers/lib/utils");

export const DEFAULT_MARGIN = ethers.utils.parseEther("90");

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

  // console.log(await copytrade.allocatedAccount(wallet2.address, 100, false));

  // return;

  const indexPrice = await perpsMarket.indexPrice(100);
  const size = DEFAULT_MARGIN.mul(BigNumber.from(10).pow(18)).div(indexPrice);
  // const size = position.positionSize.mul(-1);
  const fillPrice = await perpsMarket.fillPrice(100, size, indexPrice);

  console.log("indexPrice", formatEther(indexPrice));
  console.log("fillPrice", formatEther(fillPrice));

  console.log("size", size.toString());
  // const commands = [Command.PERP_PLACE_ORDER];
  // const inputs = [
  //   abiDecoder.encode(
  //     ["address", "uint256", "uint256", "int256", "uint256", "address"],
  //     [
  //       wallet2.address,
  //       100,
  //       BigNumber.from("170141183460469231731687303715884106886"),
  //       size,
  //       calculateAcceptablePrice(fillPrice, size),
  //       wallet2.address,
  //     ]
  //   ),
  // ];
  // const tx = await copytrade.execute(commands, inputs, {
  //   gasLimit: 2_000_000,
  // });
  // console.log("tx", tx);

  const commands = [Command.PERP_CLOSE_ORDER];
  const inputs = [
    abiDecoder.encode(
      ["address", "uint256", "uint256", "address"],
      [wallet2.address, 100, 0, wallet2.address]
    ),
  ];
  const tx = await copytrade.execute(commands, inputs, {
    gasLimit: 2_000_000,
  });
  console.log("tx", tx);
}
main();
