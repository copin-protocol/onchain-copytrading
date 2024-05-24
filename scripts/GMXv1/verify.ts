import { ethers, network, run } from "hardhat";
import {
  GMXv1NetworkConfig,
  SNXv3NetworkConfig,
} from "../../utils/types/config";
import { CONFIG } from "../../utils/constants";

async function main() {
  const usdAsset = (network.config as GMXv1NetworkConfig).USD_ASSET;
  const router = (network.config as GMXv1NetworkConfig).ROUTER;
  const positionRouter = (network.config as GMXv1NetworkConfig).POSITION_ROUTER;
  const vault = (network.config as GMXv1NetworkConfig).VAULT;
  const weth = (network.config as GMXv1NetworkConfig).WETH;
  const automate = (network.config as GMXv1NetworkConfig).AUTOMATE;
  const [wallet] = await ethers.getSigners();

  const factory = { address: CONFIG.FACTORY_ADDRESS };
  const events = { address: CONFIG.EVENTS_ADDRESS };
  const configs = { address: CONFIG.CONFIGS_ADDRESS };
  const taskCreator = { address: CONFIG.TASK_CREATOR_ADDRESS };
  const implementation = {
    address: CONFIG.IMPLEMENTATION_ADDRESS,
  };

  // await run("verify:verify", {
  //   address: factory.address,
  //   constructorArguments: [wallet.address],
  // });
  // await run("verify:verify", {
  //   address: events.address,
  //   constructorArguments: [factory.address],
  // });
  await run("verify:verify", {
    address: configs.address,
    constructorArguments: [wallet.address],
  });
  // await run("verify:verify", {
  //   address: taskCreator.address,
  //   constructorArguments: [factory.address, automate],
  // });
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
        router,
        positionRouter,
        vault,
        weth,
      },
    ],
  });
}

main();
