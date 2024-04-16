// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as accountAbi } from "../../artifacts/contracts/CopyWalletSNXv2.sol/CopyWalletSNXv2.json";
import { SNXv2NetworkConfig } from "../../utils/types/config";
import marketAbi from "../../utils/abis/perpsV2MarketAbi";
import { MARKET_SYNTHETIX, closeOrder, executeOrder } from "../../utils/snxV2";
import { CONFIG } from "../../utils/constants";
import { getRelaySigner } from "../../utils/relay";
import { Contract } from "ethers";
// const { formatUnits } = require("ethers/lib/utils");

async function main() {
  const [signer] = await ethers.getSigners();
  // const signer = await getRelaySigner();
  const account = new Contract(
    CONFIG.SMART_WALLET_ADDRESS,
    accountAbi,
    signer as any
  );
  const chain = network.config.chainId === 10 ? "mainnet" : "testnet";

  const market = MARKET_SYNTHETIX.BTC[chain];

  const perp = new Contract(market, marketAbi, signer as any);

  const tx = await account.copy(
    "0x09D45bF357e78a4c26f8384d6BCd1cDd21EE5bfc",
    market
    // {
    //   gasLimit: 1_000_000,
    // }
  );
  console.log("tx", tx);
  // await tx.wait();
  // await new Promise((resolve) =>
  //   setTimeout(() => {
  //     resolve(2);
  //   }, 3000)
  // );
  // executeOrder(perp, chain);
}

main();
