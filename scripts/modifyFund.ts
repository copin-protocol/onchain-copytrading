// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import { abi as mockERC20 } from "../artifacts/contracts/test/MockERC20.sol/MockERC20.json";
import { Command, CONFIG } from "../utils/constants";
import { CopinConfig, SNXv3NetworkConfig } from "../utils/types/config";
// const { formatUnits } = require("ethers/lib/utils");

export const FUND = ethers.utils.parseUnits("500", 6);

const abiDecoder = ethers.utils.defaultAbiCoder;

async function main() {
  const [wallet1, wallet2] = await ethers.getSigners();
  const copyWallet = new ethers.Contract(
    CONFIG.SMART_WALLET_ADDRESS,
    copyWalletAbi,
    wallet2 as any
  );

  const usdAsset = (network.config as CopinConfig).USD_ASSET;

  const fund = new ethers.Contract(usdAsset, mockERC20, wallet2 as any);

  const approvedTx = await fund.approve(copyWallet.address, FUND);
  console.log("approvedTx", approvedTx);

  const commands = [Command.OWNER_MODIFY_FUND];
  const inputs = [abiDecoder.encode(["int256"], [FUND])];
  const tx = await copyWallet.execute(commands, inputs);
  console.log("tx", tx);
}
main();
