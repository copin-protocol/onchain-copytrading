import { ethers, network } from "hardhat";
import { abi as factoryAbi } from "../artifacts/contracts/Factory.sol/Factory.json";
import { CONFIG } from "../utils/constants";
import { CopinConfig } from "../utils/types/config";

async function main() {
  const [wallet1, wallet2, wallet3] = await ethers.getSigners();
  const factory = new ethers.Contract(CONFIG.FACTORY_ADDRESS, factoryAbi);
  const executor = (network.config as CopinConfig).EXECUTOR;
  console.log("executor", executor);
  const tx = await factory.connect(wallet2 as any).newCopyWallet(executor);
  console.log(tx);
}

main();
