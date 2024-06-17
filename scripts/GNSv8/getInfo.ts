// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../../artifacts/contracts/CopyWalletGNSv8.sol/CopyWalletGNSv8.json";
import gainsV8Abi from "../../utils/abis/gainsV8Abi";
import { CONFIG } from "../../utils/constants";
import { CopinConfig, GNSv8NetworkConfig } from "../../utils/types/config";
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
    (CONFIG as GNSv8NetworkConfig).GAINS_TRADING,
    gainsV8Abi,
    wallet2 as any
  );
  const counters = await gainsV8.getCounters(copyWallet.address, 0);
  console.log("counters", counters);

  const keyIndex = await copyWallet.getKeyIndex(CONFIG.SMART_WALLET_ADDRESS, 2);
  const traderPosition = await copyWallet.getTraderPosition(1);
  console.log("keyIndex", keyIndex);
  console.log("traderPosition", traderPosition);
}
main();
