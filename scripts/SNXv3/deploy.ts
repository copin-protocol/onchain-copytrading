import { ethers, network, run } from "hardhat";
import { abi as factoryAbi } from "../../artifacts/contracts/Factory.sol/Factory.json";
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

  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(wallet.address);
  await factory.deployed();
  console.log("Factory deployed to:", factory.address);
  // const factory = new ethers.Contract(CONFIG.FACTORY_ADDRESS, factoryAbi);

  const Events = await ethers.getContractFactory("Events");
  const events = await Events.deploy(factory.address);
  await events.deployed();
  console.log("Events deployed to:", events.address);
  // const events = { address: CONFIG.EVENTS_ADDRESS };

  const Configs = await ethers.getContractFactory("Configs");
  const configs = await Configs.deploy(wallet.address);
  await configs.deployed();
  console.log("Configs deployed to:", configs.address);
  // const configs = { address: CONFIG.CONFIGS_ADDRESS };

  const TaskCreator = await ethers.getContractFactory("TaskCreator");
  const taskCreator = await TaskCreator.deploy(factory.address, automate);
  await taskCreator.deployed();
  console.log("TaskCreator deployed to:", taskCreator.address);
  // const taskCreator = { address: CONFIG.TASK_CREATOR_ADDRESS };

  const CopyWallet = await ethers.getContractFactory("CopyWalletSNXv3");
  const implementation = await CopyWallet.deploy({
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
  });
  console.log("CopyWallet Implementation deployed to:", implementation.address);
  // const implementation = {
  //   address: CONFIG.IMPLEMENTATION_ADDRESS,
  // };

  await new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, 3000)
  );

  const tx = await factory
    .connect(wallet as any)
    .upgradeCopyWalletImplementation(implementation.address);

  console.log("update", tx);

  // await run("verify:verify", {
  //   address: implementation.address,
  //   constructorArguments: [
  //     {
  //       factory: factory.address,
  //       events: events.address,
  //       configs: configs.address,
  //       usdAsset,
  //       automate,
  //       taskCreator: taskCreator.address,
  //       perpsMarket,
  //       spotMarket,
  //       sUSDC,
  //       sUSD,
  //       ethMarketId: 100,
  //     },
  //   ],
  // });
}

main();
