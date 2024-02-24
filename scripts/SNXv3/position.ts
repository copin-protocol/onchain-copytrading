import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import { SNX_V3_MARKET_IDS, CONFIG } from "../../utils/constants";
import { SNXv3NetworkConfig } from "../../utils/types/config";
import perpsMarketAbi from "../../utils/abis/perpsV3MarketAbi";
import { getRelaySigner } from "../../utils/relay";

export const DEFAULT_MARGIN = ethers.utils.parseEther("100");

async function main() {
  const signer = getRelaySigner();

  const demoSource = {
    address: CONFIG.SMART_WALLET_ADDRESS,
    // address: "0x1aA25aBC0f3A29d017638ec9Ba02668921F91016",
  };

  const copyWallet = new ethers.Contract(
    // SMART_WALLET_ADDRESS,
    CONFIG.SMART_WALLET_ADDRESS,
    copyWalletAbi,
    signer as any
  );

  const perps = (network.config as SNXv3NetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  const accountId = await copyWallet.getAllocatedAccount(
    demoSource.address,
    SNX_V3_MARKET_IDS.ETH
  );

  console.log("accountId", accountId.toString());

  const indexPrice = await perpsMarket.indexPrice(SNX_V3_MARKET_IDS.ETH);

  console.log("indexPrice", ethers.utils.formatEther(indexPrice));

  const position = await perpsMarket.getOpenPosition(
    accountId,
    SNX_V3_MARKET_IDS.ETH
  );
  console.log(
    "position",
    Object.entries(position).map(([key, value]: any[]) => ({
      [key]: ethers.utils.formatEther(value),
    }))
  );

  const keyAccount = await copyWallet.getKeyAccount(
    demoSource.address,
    SNX_V3_MARKET_IDS.ETH
  );

  console.log("keyAccount", keyAccount.toString());

  const order = await copyWallet.getAccountOrder(accountId);
  console.log(
    "order",
    Object.entries(order).map(([key, value]: any[]) => ({
      [key]: ethers.utils.formatEther(value),
    }))
  );
  console.log("market", order.market.toString());

  const availableMargin = await perpsMarket.getAvailableMargin(accountId);
  console.log("availableMargin", ethers.utils.formatEther(availableMargin));
  const withdrawableMargin = await perpsMarket.getWithdrawableMargin(accountId);
  console.log(
    "withdrawableMargin",
    ethers.utils.formatEther(withdrawableMargin)
  );
}
main();
