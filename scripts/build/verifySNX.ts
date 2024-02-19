import { ethers, network, run } from "hardhat";
import { CopinNetworkConfig } from "../../utils/types/config";
import {
  CONFIGS_ADDRESS,
  EVENTS_ADDRESS,
  FACTORY_ADDRESS,
  IMPLEMENTATION_ADDRESS,
  TASK_CREATOR_ADDRESS,
} from "../../utils/constants";

async function main() {
  const usdAsset = (network.config as CopinNetworkConfig).USD_ASSET;
  const sUSDC = (network.config as CopinNetworkConfig).SNX_SUSDC;
  const sUSD = (network.config as CopinNetworkConfig).SNX_SUSD;
  const perpsMarket = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const spotMarket = (network.config as CopinNetworkConfig).SNX_SPOT_MARKET;
  const automate = (network.config as CopinNetworkConfig).AUTOMATE;

  const [wallet] = await ethers.getSigners();

  const factory = { address: FACTORY_ADDRESS };
  const events = { address: EVENTS_ADDRESS };
  const configs = { address: CONFIGS_ADDRESS };
  const taskCreator = { address: TASK_CREATOR_ADDRESS };
  const implementation = {
    address: IMPLEMENTATION_ADDRESS,
  };

  await run("verify:verify", {
    address: factory.address,
    constructorArguments: [wallet.address],
  });
  await run("verify:verify", {
    address: events.address,
    constructorArguments: [factory.address],
  });
  await run("verify:verify", {
    address: configs.address,
    constructorArguments: [wallet.address],
  });
  await run("verify:verify", {
    address: taskCreator.address,
    constructorArguments: [factory.address, automate],
  });
  await run("verify:verify", {
    address: implementation.address,
    constructorArguments: [
      {
        factory: factory.address,
        events: events.address,
        configs: configs.address,
        usdAsset,
        automate,
        taskCreator: taskCreator.address,
        perpsMarket,
        spotMarket,
        sUSDC,
        sUSD,
        ethMarketId: 100,
      },
    ],
  });
}

main();
