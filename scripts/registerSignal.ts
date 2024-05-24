// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../artifacts/contracts/CopyWallet.sol/CopyWallet.json";
import { abi as mockERC20 } from "../artifacts/contracts/test/MockERC20.sol/MockERC20.json";
import { Command, CONFIG } from "../utils/constants";
import { CopinConfig } from "../utils/types/config";
// const { formatUnits } = require("ethers/lib/utils");

export const MARGIN = ethers.utils.parseUnits("600", 6);

async function main() {
  const [wallet1, wallet2] = await ethers.getSigners();
  const copyWallet = new ethers.Contract(
    CONFIG.SMART_WALLET_ADDRESS,
    copyWalletAbi,
    wallet2 as any
  );

  const tx = await copyWallet.registerSignal({
    gasLimit: 3000000,
  });
  console.log("tx", tx);
}
main();
