// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { SNXv2NetworkConfig } from "../../utils/types/config";
import marketAbi from "../../utils/abis/perpsV2MarketAbi";
// const { formatUnits } = require("ethers/lib/utils");
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { CONFIG } from "../../utils/constants";
import { getRelaySigner } from "../../utils/relay";
import { MARKET_SYNTHETIX, executeOrder } from "../../utils/snxV2";

async function main() {
  const signer = getRelaySigner();
  const chain = network.config.chainId === 10 ? "mainnet" : "testnet";

  // const market = "0x2B3bb4c683BFc5239B029131EEf3B1d214478d93";
  const perp = new ethers.Contract(
    MARKET_SYNTHETIX.ETH[chain],
    marketAbi,
    signer as any
  );
  executeOrder(perp, chain);
}

main();
