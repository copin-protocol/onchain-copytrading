// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../artifacts/contracts/CopyWallet.sol/CopyWallet.json";
import gainsV8Abi from "../utils/abis/gainsV8Abi";
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

  const gainsV8 = new ethers.Contract(
    CONFIG.GAINS_TRADING,
    gainsV8Abi,
    wallet2 as any
  );

  const usdAsset = (network.config as CopinConfig).USD_ASSET;

  const counters = await gainsV8.getCounters(copyWallet.address, 0);
  console.log("counters", counters);
}
main();
