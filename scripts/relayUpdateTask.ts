import { formatEther, parseEther } from "@ethersproject/units";

import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import { Command, SMART_WALLET_ADDRESS } from "../utils/constants";
import { SNXv3NetworkConfig } from "../utils/types/config";
import perpsMarketAbi from "../utils/abis/perpsMarketAbi";
import { calculateAcceptablePrice } from "../utils/perps";
import { getRelaySigner } from "../utils/relay";

const abiDecoder = ethers.utils.defaultAbiCoder;

const ethMarketId = 100;

async function main() {
  const signer = getRelaySigner();

  const demoSource = {
    address: SMART_WALLET_ADDRESS,
  };

  const copyWallet = new ethers.Contract(
    SMART_WALLET_ADDRESS,
    copyWalletAbi,
    signer as any
  );

  const perps = (network.config as SNXv3NetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  const indexPrice = (await perpsMarket.indexPrice(ethMarketId)).sub(
    ethers.utils.parseEther("1")
  );
  const commands: Command[] = [];
  const inputs: string[] = [];

  // get account allocated for source trader address + market address
  const accountId = await copyWallet.getAllocatedAccount(
    demoSource.address,
    ethMarketId
  );

  if (!accountId) {
    throw Error("Position not found");
  }

  const position = await perpsMarket.getOpenPosition(accountId, ethMarketId);
  if (position.positionSize.eq(0)) {
    throw Error("No open position");
  }
  const sizeDelta = position.positionSize.mul(-1);

  const fillPrice = await perpsMarket.fillPrice(
    ethMarketId,
    sizeDelta,
    indexPrice
  );

  console.log("accountId", accountId.toString());
  console.log("indexPrice", formatEther(indexPrice));
  console.log("fillPrice", formatEther(fillPrice));
  console.log("sizeDelta", formatEther(sizeDelta));

  commands.push(Command.GELATO_UPDATE_TASK);
  inputs.push(
    abiDecoder.encode(
      ["uint256", "int256", "int256", "uint256", "uint256"],
      [1, 0, 0, indexPrice, calculateAcceptablePrice(fillPrice, sizeDelta)]
    )
  );

  console.log("commands", commands);
  const tx = await copyWallet.execute(commands, inputs);
  console.log("tx", tx);
}
main();
