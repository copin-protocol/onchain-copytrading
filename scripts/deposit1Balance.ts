import { ethers } from "hardhat";
import gelato1BalanceAbi from "../utils/abis/gelato1BalanceAbi";
import { parseEther } from "ethers/lib/utils";

// ONLY RUN ON GOERLI AND POLYGON!!!
async function main() {
  const [wallet1] = await ethers.getSigners();
  const gelato1Balance = new ethers.Contract(
    "0x7506C12a824d73D9b08564d5Afc22c949434755e",
    gelato1BalanceAbi,
    wallet1 as any
  );
  const tx = await gelato1Balance.depositNative(
    "0xE9D1E94E8A933b2fDcc8415D9D697e5070c4c421",
    {
      value: parseEther("0.05"),
    }
  );
  console.log(tx);
}

main();
