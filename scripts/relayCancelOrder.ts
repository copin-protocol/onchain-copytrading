import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copytradeAbi } from "../artifacts/contracts/CopytradeSNX.sol/CopytradeSNX.json";
import {
  Command,
  MARKET_IDS,
  SMART_COPYTRADE_ADDRESS,
} from "../utils/constants";
import { CopinNetworkConfig } from "../utils/types/config";
import perpsMarketAbi from "../utils/abis/perpsMarketAbi";
import { BigNumber } from "ethers";
import { calculateAcceptablePrice, getTradeSign } from "../utils/perps";
import { getRelaySigner } from "../utils/relay";

const abiDecoder = ethers.utils.defaultAbiCoder;

async function main() {
  const signer = getRelaySigner();
  const demoSource = {
    address: SMART_COPYTRADE_ADDRESS,
  };

  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    signer as any
  );

  const tx = await copytrade.execute(
    [Command.PERP_CANCEL_ORDER],
    [
      abiDecoder.encode(
        ["address", "uint256"],
        [demoSource.address, MARKET_IDS.ETH]
      ),
    ]
  );

  console.log("tx", tx);
}
main();
