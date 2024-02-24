import { ethers, network, run } from "hardhat";
import { abi as factoryAbi } from "../../artifacts/contracts/Factory.sol/Factory.json";
import { SNXv2NetworkConfig } from "../../utils/types/config";
import { CONFIG } from "../../utils/constants";

async function main() {
  const [wallet] = await ethers.getSigners();

  // const Factory = await ethers.getContractFactory("Factory");
  // const factory = await Factory.deploy(wallet.address);
  // await factory.deployed();
  // console.log("Factory deployed to:", factory.address);
  const factory = new ethers.Contract(CONFIG.FACTORY_ADDRESS, factoryAbi);
  console.log("factory", factory.address);

  // const Events = await ethers.getContractFactory("Events");
  // const events = await Events.deploy(factory.address);
  // await events.deployed();
  // console.log("Events deployed to:", events.address);
  const events = { address: CONFIG.EVENTS_ADDRESS };

  // const Configs = await ethers.getContractFactory("Configs");
  // const configs = await Configs.deploy(wallet.address);
  // await configs.deployed();
  // console.log("Configs deployed to:", configs.address);
  const configs = { address: CONFIG.CONFIGS_ADDRESS };

  const usdAsset = (network.config as SNXv2NetworkConfig).USD_ASSET;
  const exchangeRate = (network.config as SNXv2NetworkConfig).SNX_EXCHANGE_RATE;
  const marketManager = (network.config as SNXv2NetworkConfig)
    .SNX_MARKET_MANAGER;
  const systemStatus = (network.config as SNXv2NetworkConfig).SNX_SYSTEM_STATUS;
  const automate = (network.config as SNXv2NetworkConfig).AUTOMATE;

  // const TaskCreator = await ethers.getContractFactory("TaskCreator");
  // const taskCreator = await TaskCreator.deploy(factory.address, automate);
  // await taskCreator.deployed();
  // console.log("TaskCreator deployed to:", taskCreator.address);
  const taskCreator = { address: CONFIG.TASK_CREATOR_ADDRESS };

  console.log({
    factory: factory.address,
    events: events.address,
    configs: configs.address,
    usdAsset,
    automate,
    taskCreator: taskCreator.address,
    exchangeRate,
    marketManager,
    systemStatus,
  });

  const Account = await ethers.getContractFactory("CopyWalletSNXv2");

  // const implementation = await Account.deploy({
  //   factory: factory.address,
  //   events: events.address,
  //   configs: configs.address,
  //   usdAsset,
  //   automate,
  //   taskCreator: taskCreator.address,
  //   exchangeRate,
  //   marketManager,
  //   systemStatus,
  // });
  // console.log("Account Implementation deployed to:", implementation.address);
  const implementation = {
    address: CONFIG.IMPLEMENTATION_ADDRESS,
  };

  const upgradeTx = await factory
    .connect(wallet as any)
    .upgradeCopyWalletImplementation(implementation.address);

  console.log("upgradeTx", upgradeTx);

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
