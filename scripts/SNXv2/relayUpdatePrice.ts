import { ethers } from "hardhat";

// const { formatUnits } = require("ethers/lib/utils");
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

import { getRelaySigner } from "../../utils/relay";
import { MARKETS } from "../../utils/snxV2";

const ABI = [
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "updateData",
        type: "bytes[]",
      },
    ],
    name: "updatePriceFeeds",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "updateData",
        type: "bytes[]",
      },
    ],
    name: "getUpdateFee",
    outputs: [
      {
        internalType: "uint256",
        name: "feeAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// 0x81f6db11736589eab14b59c5251c27482e6c7c12

async function main() {
  const [wallet] = await ethers.getSigners();
  const signer = getRelaySigner();

  // const market = "0x2B3bb4c683BFc5239B029131EEf3B1d214478d93";
  const pythContract = new ethers.Contract(
    "0x0708325268dF9F66270F1401206434524814508b",
    ABI,
    signer as any
  );

  const connection = new EvmPriceServiceConnection("https://hermes.copin.io"); // See Hermes endpoints section below for other endpoints

  console.log("length", MARKETS.map((m) => m.priceFeedId).length);

  const priceIds = MARKETS.map((m) => m.priceFeedId);
  // .slice(0, 20)
  // In order to use Pyth prices in your protocol you need to submit the price update data to Pyth contract in your target
  // chain. `getPriceFeedsUpdateData` creates the update data which can be submitted to your contract. Then your contract should
  // call the Pyth Contract with this data.
  const priceUpdateData = await connection.getPriceFeedsUpdateData(priceIds);

  // If the user is paying the price update fee, you need to fetch it from the Pyth contract.
  // Please refer to https://docs.pyth.network/documentation/pythnet-price-feeds/on-demand#fees for more information.
  //
  // `pythContract` below is a web3.js contract; if you wish to use ethers, you need to change it accordingly.
  // You can find the Pyth interface ABI in @pythnetwork/pyth-sdk-solidity npm package.
  const updateFee = await pythContract.getUpdateFee(priceUpdateData);

  console.log("updateFee", updateFee.toString());

  const tx = await pythContract.updatePriceFeeds(priceUpdateData, {
    value: updateFee,
  });
  console.log("executeTx", tx);
}

main();
