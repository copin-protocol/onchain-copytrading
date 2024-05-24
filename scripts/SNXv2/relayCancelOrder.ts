// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as accountAbi } from "../../artifacts/contracts/CopyWalletSNXv2.sol/CopyWalletSNXv2.json";
import { SNXv2NetworkConfig } from "../../utils/types/config";
import { CONFIG } from "../../utils/constants";
import { MARKET_SYNTHETIX } from "../../utils/snxV2";
// const { formatUnits } = require("ethers/lib/utils");

async function main() {
  const [, wallet2] = await ethers.getSigners();
  const account = new ethers.Contract(CONFIG.SMART_WALLET_ADDRESS, accountAbi);

  const abi = ethers.utils.defaultAbiCoder;

  const tx = await account.connect(wallet2 as any).execute(
    [2],
    [abi.encode(["address"], [MARKET_SYNTHETIX.BTC])]
    // {
    //   gasLimit: 3_000_000,
    // }
  );
  console.log("tx", tx);
}

main();
