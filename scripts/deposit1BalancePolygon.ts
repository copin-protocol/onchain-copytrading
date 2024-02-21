import { ethers } from "hardhat";
import gelato1BalanceAbi from "../utils/abis/gelato1BalanceAbi";
import { abi as mockERC20 } from "../artifacts/contracts/test/MockERC20.sol/MockERC20.json";
import { TASK_CREATOR_ADDRESS } from "../utils/constants";

// ONLY RUN ON GOERLI AND POLYGON!!!
async function main() {
  const [wallet1] = await ethers.getSigners();
  const USDC = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
  const gelato1Balance = new ethers.Contract(
    "0x7506C12a824d73D9b08564d5Afc22c949434755e",
    gelato1BalanceAbi,
    wallet1 as any
  );

  const usdcContract = new ethers.Contract(USDC, mockERC20, wallet1 as any);

  const amount = ethers.utils.parseUnits("20", 6);

  const approvedTx = await usdcContract.approve(gelato1Balance.address, amount);
  console.log("approvedTx", approvedTx);

  const tx = await gelato1Balance.depositToken(
    TASK_CREATOR_ADDRESS,
    USDC,
    amount
  );
  console.log(tx);
}

main();
