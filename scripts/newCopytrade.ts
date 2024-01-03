import { ethers, network } from "hardhat";
import { abi as factoryAbi } from "../artifacts/contracts/Factory.sol/Factory.json";
import { FACTORY_ADDRESS } from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";

async function main() {
  const [wallet1, wallet2, wallet3] = await ethers.getSigners();
  const factory = new ethers.Contract(FACTORY_ADDRESS, factoryAbi);
  const executor = (network.config as CopinNetworkConfig).EXECUTOR;
  console.log("executor", executor);
  const tx = await factory.connect(wallet2 as any).newCopytrade(executor);
  console.log(tx);
}

main();
