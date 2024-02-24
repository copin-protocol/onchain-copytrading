import { ethers, network, run } from "hardhat";
import { SNXv3NetworkConfig } from "../../utils/types/config";
import { CONFIG } from "../../utils/constants";

async function main() {
  const usdAsset = (network.config as SNXv3NetworkConfig).USD_ASSET;
  const sUSDC = (network.config as SNXv3NetworkConfig).SNX_SUSDC;
  const sUSD = (network.config as SNXv3NetworkConfig).SNX_SUSD;
  const perpsMarket = (network.config as SNXv3NetworkConfig).SNX_PERPS_MARKET;
  const spotMarket = (network.config as SNXv3NetworkConfig).SNX_SPOT_MARKET;
  const automate = (network.config as SNXv3NetworkConfig).AUTOMATE;

  const [wallet] = await ethers.getSigners();

  const factory = { address: CONFIG.FACTORY_ADDRESS };
  const events = { address: CONFIG.EVENTS_ADDRESS };
  const configs = { address: CONFIG.CONFIGS_ADDRESS };
  const taskCreator = { address: CONFIG.TASK_CREATOR_ADDRESS };
  const implementation = {
    address: CONFIG.IMPLEMENTATION_ADDRESS,
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
