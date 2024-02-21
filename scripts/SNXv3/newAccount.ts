// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers } from "hardhat";
import { abi as copyWalletAbi } from "../../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import { Command, SMART_WALLET_ADDRESS } from "../../utils/constants";

export const DEFAULT_MARGIN = ethers.utils.parseEther("100");

const abiDecoder = ethers.utils.defaultAbiCoder;

async function main() {
  const [, wallet2] = await ethers.getSigners();
  const copyWallet = new ethers.Contract(
    SMART_WALLET_ADDRESS,
    copyWalletAbi,
    wallet2 as any
  );

  const commands = [Command.PERP_CREATE_ACCOUNT];
  const inputs: number[] = [0];
  const tx = await copyWallet.execute(commands, inputs);
  console.log("tx", tx);
}
main();
