import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import { Command, SNX_V3_MARKET_IDS, CONFIG } from "../../utils/constants";
import { SNXv3NetworkConfig } from "../../utils/types/config";
import perpsMarketAbi from "../../utils/abis/perpsV3MarketAbi";
import { BigNumber } from "ethers";
import { calculateAcceptablePrice, getTradeSign } from "../../utils/snxV3";
import { getRelaySigner } from "../../utils/relay";

const abiDecoder = ethers.utils.defaultAbiCoder;

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

  const tx = await copyWallet.execute(
    [Command.PERP_CANCEL_ORDER],
    [
      abiDecoder.encode(
        ["address", "uint256"],
        [demoSource.address, SNX_V3_MARKET_IDS.ETH]
      ),
    ]
  );

  console.log("tx", tx);
}
main();
