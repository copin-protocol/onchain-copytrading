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

  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    signer as any
  );

  const commands: Command[] = [];
  const inputs: string[] = [];

  commands.push(Command.GELETO_CANCEL_TASK);
  inputs.push(
    abiDecoder.encode(
      ["uint256"],
      [
        0,
        // demoSource.address,
      ]
    )
  );

  console.log("commands", commands);
  const tx = await copytrade.execute(commands, inputs, {
    gasLimit: 2_000_000,
  });
  console.log("tx", tx);
}
main();
