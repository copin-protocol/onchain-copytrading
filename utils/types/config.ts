import { NetworkConfig } from "hardhat/types";

export type CopinNetworkConfig = NetworkConfig & {
  USD_ASSET: string;
  EXECUTOR: string;
  SNX_PERPS_MARKET: string;
  SNX_SPOT_MARKET: string;
  SNX_SUSDC: string;
  SNX_SUSD: string;
  AUTOMATE: string;
  url: string;
};
