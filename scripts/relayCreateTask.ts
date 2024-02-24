import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import { Command, CONFIG } from "../utils/constants";
import { SNXv3NetworkConfig } from "../utils/types/config";
import perpsMarketAbi from "../utils/abis/perpsV3MarketAbi";
import { calculateAcceptablePrice } from "../utils/snxV3";
import { getRelaySigner } from "../utils/relay";

const abiDecoder = ethers.utils.defaultAbiCoder;

const ethMarketId = 100;

async function main() {
  const signer = getRelaySigner();

  const demoSource = {
    address: CONFIG.SMART_WALLET_ADDRESS,
  };

  const copyWallet = new ethers.Contract(
    CONFIG.SMART_WALLET_ADDRESS,
    copyWalletAbi,
    signer as any
  );

  const perps = (network.config as SNXv3NetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  const indexPrice = (await perpsMarket.indexPrice(ethMarketId)).add(
    ethers.utils.parseEther("100")
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

  commands.push(Command.GELATO_CREATE_TASK);
  inputs.push(
    abiDecoder.encode(
      [
        "uint256",
        "address",
        "uint256",
        "int256",
        "int256",
        "uint256",
        "uint256",
        "address",
      ],
      [
        0,
        demoSource.address,
        ethMarketId,
        0,
        sizeDelta,
        indexPrice,
        calculateAcceptablePrice(fillPrice, sizeDelta),
        demoSource.address,
      ]
    )
  );

  console.log("commands", commands);
  const tx = await copyWallet.execute(commands, inputs);
  console.log("tx", tx);
}
main();
