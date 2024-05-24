import { ethers, network, run } from "hardhat";
import { SNXv2NetworkConfig } from "../../utils/types/config";
import { CONFIG } from "../../utils/constants";

async function main() {
  const usdAsset = (network.config as SNXv2NetworkConfig).USD_ASSET;
  const exchangeRate = (network.config as SNXv2NetworkConfig).SNX_EXCHANGE_RATE;
  const marketManager = (network.config as SNXv2NetworkConfig)
    .SNX_MARKET_MANAGER;
  const systemStatus = (network.config as SNXv2NetworkConfig).SNX_SYSTEM_STATUS;
  const automate = (network.config as SNXv2NetworkConfig).AUTOMATE;

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
        exchangeRate,
        marketManager,
        systemStatus,
      },
    ],
  });
}

main();
