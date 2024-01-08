import { formatEther, parseEther } from "@ethersproject/units";
import { Defender } from "@openzeppelin/defender-sdk";
import { ethers, network } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import { abi as mockERC20 } from "../artifacts/contracts/test/MockERC20.sol/MockERC20.json";
import {
  Command,
  RELAYER_API_KEY,
  RELAYER_API_SECRET,
  SMART_COPYTRADE_ADDRESS,
} from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";
import perpsMarketAbi from "../utils/abis/perpsMarketAbi";
import spotMarketAbi from "../utils/abis/spotMarketAbi";
import { BigNumber } from "ethers";
import { calculateAcceptablePrice } from "../utils/perps";
// const { formatUnits } = require("ethers/lib/utils");

const abiDecoder = ethers.utils.defaultAbiCoder;

const ethMarketId = 100;

async function main() {
  const credentials = {
    relayerApiKey: RELAYER_API_KEY,
    relayerApiSecret: RELAYER_API_SECRET,
  };
  const client = new Defender(credentials);

  const provider = client.relaySigner.getProvider();
  // const config = network.config as CopinNetworkConfig;
  // const nodeURL = config.url;
  // const provider = new JsonRpcProvider(nodeURL);
  // const signer: any = new ethers.Wallet(process.env.PRIVATE_KEY_3!, provider);

  const signer = client.relaySigner.getSigner(provider, {
    speed: "fast",
    validForSeconds: 120,
  });

  const [, demoSource] = await ethers.getSigners();
  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    signer as any
  );

  const perps = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  const indexPrice = (await perpsMarket.indexPrice(ethMarketId)).sub(
    ethers.utils.parseEther("1")
  );
  const commands: Command[] = [];
  const inputs: string[] = [];

  // get account allocated for source trader address + market address
  const accountId = await copytrade.allocatedAccount(
    demoSource.address,
    ethMarketId,
    false
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
  const tx = await copytrade.execute(commands, inputs, {
    gasLimit: 2_000_000,
  });
  console.log("tx", tx);
}
main();
