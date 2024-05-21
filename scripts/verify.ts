import { ethers, network, run } from "hardhat";
import { CopinConfig } from "../utils/types/config";
import { CONFIG } from "../utils/constants";

async function main() {
  const usdAsset = (network.config as CopinConfig).USD_ASSET;
  const gainsTrading = (network.config as CopinConfig).GAINS_TRADING;

  const [wallet] = await ethers.getSigners();

  const factory = { address: CONFIG.FACTORY_ADDRESS };
  const events = { address: CONFIG.EVENTS_ADDRESS };
  const configs = { address: CONFIG.CONFIGS_ADDRESS };
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
    address: implementation.address,
    constructorArguments: [
      {
        factory: factory.address,
        events: events.address,
        configs: configs.address,
        usdAsset,
        gainsTrading,
      },
    ],
  });
}

main();
