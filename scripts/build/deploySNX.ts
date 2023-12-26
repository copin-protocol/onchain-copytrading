import { ethers, network, run } from "hardhat";
import { abi as factoryAbi } from "../../artifacts/contracts/Factory.sol/Factory.json";
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
  const trustedForwarder = (network.config as CopinNetworkConfig)
    .TRUSTED_FORWARDER;
  const automate = (network.config as CopinNetworkConfig).AUTOMATE;

  const [wallet] = await ethers.getSigners();

  // const Factory = await ethers.getContractFactory("Factory");
  // const factory = await Factory.deploy(wallet.address);
  // await factory.deployed();
  // console.log("Factory deployed to:", factory.address);
  const factory = new ethers.Contract(FACTORY_ADDRESS, factoryAbi);

  // const Events = await ethers.getContractFactory("Events");
  // const events = await Events.deploy(factory.address);
  // await events.deployed();
  // console.log("Events deployed to:", events.address);
  const events = { address: EVENTS_ADDRESS };

  // const Configs = await ethers.getContractFactory("Configs");
  // const configs = await Configs.deploy(wallet.address);
  // await configs.deployed();
  // console.log("Configs deployed to:", configs.address);
  const configs = { address: CONFIGS_ADDRESS };

  // const TaskCreator = await ethers.getContractFactory("TaskCreator");
  // const taskCreator = await TaskCreator.deploy(factory.address, automate);
  // await taskCreator.deployed();
  // console.log("TaskCreator deployed to:", taskCreator.address);
  const taskCreator = { address: TASK_CREATOR_ADDRESS };

  const Copytrade = await ethers.getContractFactory("CopytradeSNX");
  const implementation = await Copytrade.deploy({
    factory: factory.address,
    events: events.address,
    configs: configs.address,
    usdAsset,
    trustedForwarder,
    automate,
    taskCreator: taskCreator.address,
    perpsMarket,
    spotMarket,
    sUSDC,
    sUSD,
    ethMarketId: 100,
  });
  console.log("Copytrade Implementation deployed to:", implementation.address);
  // const implementation = {
  //   address: IMPLEMENTATION_ADDRESS,
  // };

  await new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, 3000)
  );

  const tx = await factory
    .connect(wallet as any)
    .upgradeCopytradeImplementation(implementation.address);

  console.log(tx);

  await run("verify:verify", {
    address: implementation.address,
    constructorArguments: [
      {
        factory: factory.address,
        events: events.address,
        configs: configs.address,
        usdAsset,
        trustedForwarder,
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
