import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import { MARKET_IDS, SMART_COPYTRADE_ADDRESS } from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";
import perpsMarketAbi from "../utils/abis/perpsMarketAbi";
import { getRelaySigner } from "../utils/relay";

export const DEFAULT_MARGIN = ethers.utils.parseEther("100");

async function main() {
  const signer = getRelaySigner();

  const demoSource = {
    address: SMART_COPYTRADE_ADDRESS,
    // address: "0x1aA25aBC0f3A29d017638ec9Ba02668921F91016",
  };

  const copytrade = new ethers.Contract(
    // SMART_COPYTRADE_ADDRESS,
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    signer as any
  );

  const perps = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  const accountId = await copytrade.getAllocatedAccount(
    demoSource.address,
    MARKET_IDS.ETH
  );

  console.log("accountId", accountId.toString());

  const indexPrice = await perpsMarket.indexPrice(MARKET_IDS.ETH);

  console.log("indexPrice", ethers.utils.formatEther(indexPrice));

  const position = await perpsMarket.getOpenPosition(accountId, MARKET_IDS.ETH);
  console.log(
    "position",
    Object.entries(position).map(([key, value]: any[]) => ({
      [key]: ethers.utils.formatEther(value),
    }))
  );

  const keyAccount = await copytrade.getKeyAccount(
    demoSource.address,
    MARKET_IDS.ETH
  );

  console.log("keyAccount", keyAccount.toString());

  const order = await copytrade.getAccountOrder(accountId);
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
