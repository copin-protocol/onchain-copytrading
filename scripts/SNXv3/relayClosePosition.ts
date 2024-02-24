import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import { SNX_V3_MARKET_IDS, CONFIG } from "../../utils/constants";
import { SNXv3NetworkConfig } from "../../utils/types/config";
import perpsMarketAbi from "../../utils/abis/perpsV3MarketAbi";
import { calculateAcceptablePrice } from "../../utils/snxV3";
import { getRelaySigner } from "../../utils/relay";

async function main() {
  const signer = getRelaySigner();

  const copyWallet = new ethers.Contract(
    CONFIG.SMART_WALLET_ADDRESS,
    copyWalletAbi,
    signer as any
  );

  const perps = (network.config as SNXv3NetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  const indexPrice = await perpsMarket.indexPrice(SNX_V3_MARKET_IDS.ETH);

  const accountId = "170141183460469231731687303715884107098";

  const position = await perpsMarket.getOpenPosition(
    accountId,
    SNX_V3_MARKET_IDS.ETH
  );
  if (position.positionSize.eq(0)) {
    throw Error("No open position");
  }
  const sizeDelta = position.positionSize.mul(-1);

  const fillPrice = await perpsMarket.fillPrice(
    SNX_V3_MARKET_IDS.ETH,
    sizeDelta,
    indexPrice
  );

  console.log("accountId", accountId.toString());
  console.log("indexPrice", formatEther(indexPrice));
  console.log("fillPrice", formatEther(fillPrice));
  console.log("sizeDelta", formatEther(sizeDelta));

  const tx = await copyWallet.closePosition(
    accountId,
    SNX_V3_MARKET_IDS.ETH,
    calculateAcceptablePrice(fillPrice, sizeDelta)
  );
  console.log("tx", tx);
}
main();
