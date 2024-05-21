import { NetworkConfig } from "hardhat/types";

export type CopinConfig = NetworkConfig & {
  url: string;
  USD_ASSET: string;
  FACTORY_ADDRESS: string;
  EVENTS_ADDRESS: string;
  CONFIGS_ADDRESS: string;
  IMPLEMENTATION_ADDRESS: string;
  SMART_WALLET_ADDRESS: string;
  GAINS_TRADING: string;
};
