import { formatEther, parseEther } from "@ethersproject/units";
import { ethers } from "hardhat";
import { abi as copyWalletAbi } from "../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import { Command, SMART_WALLET_ADDRESS } from "../utils/constants";
import { getRelaySigner } from "../utils/relay";

const abiDecoder = ethers.utils.defaultAbiCoder;

async function main() {
  const signer = getRelaySigner();

  const copyWallet = new ethers.Contract(
    SMART_WALLET_ADDRESS,
    copyWalletAbi,
    signer as any
  );

  const commands: Command[] = [];
  const inputs: string[] = [];

  commands.push(Command.GELETO_CANCEL_TASK);
  inputs.push(abiDecoder.encode(["uint256"], [0]));

  console.log("commands", commands);
  const tx = await copyWallet.execute(commands, inputs);
  console.log("tx", tx);
}
main();
