// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import { abi as mockERC20 } from "../artifacts/contracts/test/MockERC20.sol/MockERC20.json";
import { Command, SMART_COPYTRADE_ADDRESS } from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";
// const { formatUnits } = require("ethers/lib/utils");

export const DEFAULT_FUNDS = ethers.utils.parseEther("100");

const abiDecoder = ethers.utils.defaultAbiCoder;

async function main() {
  const [, wallet2] = await ethers.getSigners();
  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    wallet2
  );

  const usdAsset = (network.config as CopinNetworkConfig).USD_ASSET;

  const fund = new ethers.Contract(usdAsset, mockERC20, wallet2);

  // const approvedTx = await fund.approve(copytrade.address, DEFAULT_FUNDS);
  // console.log("approvedTx", approvedTx);

  console.log(ethers.utils.formatBytes32String("ADMIN"));

  const commands = [
    // Command.OWNER_MODIFY_COLLATERAL,
    Command.PERP_MODIFY_COLLATERAL,
  ];
  const inputs = [
    // abiDecoder.encode(["int256"], [DEFAULT_FUNDS]),
    abiDecoder.encode(["int256"], [DEFAULT_FUNDS.mul(2).mul(-1)]),
  ];
  const tx = await copytrade.execute(commands, inputs, {
    gasLimit: 2_000_000,
  });
  console.log("tx", tx);
}
main();
