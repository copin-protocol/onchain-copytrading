// 0x81f6db11736589eab14b59c5251c27482e6c7c12
import { ethers, network } from "hardhat";
import { abi as accountAbi } from "../../artifacts/contracts/CopyWalletSNXv2.sol/CopyWalletSNXv2.json";
import {
  GMXv1NetworkConfig,
  SNXv2NetworkConfig,
} from "../../utils/types/config";
import marketAbi from "../../utils/abis/perpsV2MarketAbi";
import { MARKET_SYNTHETIX, executeOrder, placeOrder } from "../../utils/snxV2";
import { CONFIG, Command } from "../../utils/constants";
import { getRelaySigner } from "../../utils/relay";
import { BigNumber, ContractReceipt } from "ethers";
import { calculateAcceptablePrice } from "../../utils/calculate";
import gmxPositionRouterAbi from "../../utils/abis/gmxPositionRouterAbi";
import gmxVaultAbi from "../../utils/abis/gmxVaultAbi";
// const { formatUnits } = require("ethers/lib/utils");

const abi = ethers.utils.defaultAbiCoder;

async function main() {
  const signer = getRelaySigner();
  const account = new ethers.Contract(
    CONFIG.SMART_WALLET_ADDRESS,
    accountAbi,
    signer as any
  );
  console.log("account", account.address);

  const tx = await account.execute(
    [Command.PERP_CLOSE_ORDER],
    [abi.encode(["address", "uint256"], [CONFIG.SMART_WALLET_ADDRESS, 2])]
  );
  console.log("tx", tx);
}

main();
