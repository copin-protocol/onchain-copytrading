import { NetworkConfig } from "hardhat/types";

export type CopinConfig = {
  url: string;
  USD_ASSET: string;
  AUTOMATE: string;
  EXECUTOR: string;
  EVENTS_ADDRESS: string;
  CONFIGS_ADDRESS: string;
  TASK_CREATOR_ADDRESS: string;
  IMPLEMENTATION_ADDRESS: string;
};

export type SNXv3NetworkConfig = NetworkConfig &
  CopinConfig & {
    SNX_PERPS_MARKET: string;
    SNX_SPOT_MARKET: string;
    SNX_SUSDC: string;
    SNX_SUSD: string;
  };
