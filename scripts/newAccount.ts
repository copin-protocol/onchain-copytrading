// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import { abi as mockERC20 } from "../artifacts/contracts/test/MockERC20.sol/MockERC20.json";
import { Command, SMART_COPYTRADE_ADDRESS } from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";
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

  const commands = [Command.PERP_CREATE_ACCOUNT];
  const inputs: number[] = [0];
  const tx = await copytrade.execute(commands, inputs);
  console.log("tx", tx);
}
main();
