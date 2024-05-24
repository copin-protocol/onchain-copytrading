import { ethers, network, run } from "hardhat";
import { abi as factoryAbi } from "../artifacts/contracts/Factory.sol/Factory.json";
import { CopinConfig } from "../utils/types/config";
import { CONFIG } from "../utils/constants";

async function main() {
  const [wallet] = await ethers.getSigners();

  // const Factory = await ethers.getContractFactory("Factory");
  // const factory = await Factory.deploy(wallet.address);
  // await factory.deployed();
  // console.log("Factory deployed to:", factory.address);
  const factory = new ethers.Contract(CONFIG.FACTORY_ADDRESS, factoryAbi);

  const usdAsset = (network.config as CopinConfig).USD_ASSET;
  const link = (network.config as CopinConfig).LINK;
  const automationRegistrar = (network.config as CopinConfig)
    .AUTOMATION_REGISTRAR;
  const gainsTrading = (network.config as CopinConfig).GAINS_TRADING;

  const CopyWallet = await ethers.getContractFactory("CopyWallet");

  const feeReceiver = wallet.address;

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

  const implementation = await CopyWallet.deploy({
    factory: factory.address,
    events: events.address,
    configs: configs.address,
    usdAsset,
    gainsTrading,
    link,
    automationRegistrar,
  });
  await implementation.deployed();
  console.log("Copytrade Implementation deployed to:", implementation.address);
  // const implementation = {
  //   address: CONFIG.IMPLEMENTATION_ADDRESS,
  // };

  const tx = await factory
    .connect(wallet as any)
    .upgradeCopyWalletImplementation(implementation.address);
  console.log("tx", tx);

  // await run("verify:verify", {
  //   address: factory.address,
  //   constructorArguments: [wallet.address],
  // });
}

main();
