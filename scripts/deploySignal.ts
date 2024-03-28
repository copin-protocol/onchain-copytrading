import { ethers, network, run } from "hardhat";
async function main() {
  const [wallet] = await ethers.getSigners();

  const Signal = await ethers.getContractFactory("TestSignal");
  const signal = await Signal.deploy();
  await signal.deployed();
  console.log("Signal deployed to:", signal.address);

  await run("verify:verify", {
    address: signal.address,
    constructorArguments: [],
  });
}

main();
