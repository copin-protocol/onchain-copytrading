import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import {
  Command,
  MARKET_IDS,
  SMART_WALLET_ADDRESS,
} from "../../utils/constants";
import { SNXv3NetworkConfig } from "../../utils/types/config";
import perpsMarketAbi from "../../utils/abis/perpsMarketAbi";
import { BigNumber } from "ethers";
import { calculateAcceptablePrice, getTradeSign } from "../../utils/perps";
import { getRelaySigner } from "../../utils/relay";

const abiDecoder = ethers.utils.defaultAbiCoder;

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

  const tx = await copyWallet.execute(
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
