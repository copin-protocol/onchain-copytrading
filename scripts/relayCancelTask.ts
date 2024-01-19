import { formatEther, parseEther } from "@ethersproject/units";
import { ethers } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import { Command, SMART_COPYTRADE_ADDRESS } from "../utils/constants";
import { getRelaySigner } from "../utils/relay";

const abiDecoder = ethers.utils.defaultAbiCoder;

async function main() {
  const signer = getRelaySigner();

  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    signer as any
  );

  const commands: Command[] = [];
  const inputs: string[] = [];

  commands.push(Command.GELETO_CANCEL_TASK);
  inputs.push(abiDecoder.encode(["uint256"], [0]));

  console.log("commands", commands);
  const tx = await copytrade.execute(commands, inputs);
  console.log("tx", tx);
}
main();
