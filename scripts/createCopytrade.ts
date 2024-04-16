import { ethers, network } from "hardhat";
import { abi as accountAbi } from "../artifacts/contracts/CopyWalletSNXv2.sol/CopyWalletSNXv2.json";
import { CONFIG } from "../utils/constants";
import { CopinConfig } from "../utils/types/config";
import { Contract } from "ethers";

async function main() {
  const [, signer] = await ethers.getSigners();
  const account = new Contract(
    CONFIG.SMART_WALLET_ADDRESS,
    accountAbi,
    signer as any
  );
  if (signer.provider) {
    const feeData = await signer.provider.getFeeData();
    const tx = await account.createCopytrade(
      "0x09D45bF357e78a4c26f8384d6BCd1cDd21EE5bfc",
      {
        margin: ethers.utils.parseEther("100"),
        maxMarginPerOI: ethers.utils.parseEther("150"),
        leverage: 10,
        enabled: true,
      },
      {
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas, // Recommended maxPriorityFeePerGas
        maxFeePerGas: feeData.maxFeePerGas, // Recommended maxFeePerGas
      }
    );
    console.log(tx);
  }
}

main();
