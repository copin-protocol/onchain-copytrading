import { ethers } from "hardhat";
import gelato1BalanceAbi from "../utils/abis/gelato1BalanceAbi";
import { parseEther } from "ethers/lib/utils";
import { CONFIG } from "../utils/constants";

// ONLY RUN ON GOERLI AND POLYGON!!!
async function main() {
  const [wallet1] = await ethers.getSigners();
  const gelato1Balance = new ethers.Contract(
    "0x7506C12a824d73D9b08564d5Afc22c949434755e",
    gelato1BalanceAbi,
    wallet1 as any
  );
  const tx = await gelato1Balance.depositNative(CONFIG.TASK_CREATOR_ADDRESS, {
    value: parseEther("0.05"),
  });
  console.log(tx);
}

main();
