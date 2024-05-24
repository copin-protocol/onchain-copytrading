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
  CONFIG.SMART_WALLET_ADDRESS = "0xfe4A52967092806d12A8AD6e30119930e8D10098";
  const account = new ethers.Contract(
    CONFIG.SMART_WALLET_ADDRESS,
    accountAbi,
    signer as any
  );
  console.log("account", account.address);

  const positionRouter = new ethers.Contract(
    (CONFIG as GMXv1NetworkConfig).POSITION_ROUTER,
    gmxPositionRouterAbi,
    signer as any
  );

  const vault = new ethers.Contract(
    (CONFIG as GMXv1NetworkConfig).VAULT,
    gmxVaultAbi,
    signer as any
  );

  // const postion = await account.positions(
  //   BigNumber.from("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1")
  // );

  // console.log(
  //   "postion",
  //   postion.map((e: any) => e.toString())
  // );

  // const executorUsdFee = await account.executorUsdFee(
  //   ethers.utils.parseEther("1").div(5000)
  // );

  // console.log("executorUsdFee", executorUsdFee.toString());

  // return;

  const market = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
  const isLong = false;
  const isIncrease = true;
  const collateral = ethers.utils.parseUnits("30", 6);
  const sizeUsd = ethers.utils.parseEther("300");

  const minExecutionFee = await positionRouter.minExecutionFee();
  console.log("minExecutionFee", ethers.utils.formatEther(minExecutionFee));

  const priceFn = (isIncrease ? isLong : !isLong)
    ? vault.getMaxPrice
    : vault.getMinPrice;

  const priceD30 = await priceFn(market);
  const price = priceD30.div(ethers.BigNumber.from(10).pow(12));

  console.log("price", ethers.utils.formatEther(price));

  // return;

  const tx = await account.execute(
    [Command.PERP_PLACE_ORDER],
    [
      abi.encode(
        ["address", "address", "bool", "bool", "uint256", "uint256", "uint256"],
        [
          "0xBe9F2e6537Fde4c7b010754c83ef6644b6eb9994",
          market,
          isLong,
          isIncrease,
          collateral,
          sizeUsd,
          calculateAcceptablePrice(price, isIncrease ? isLong : !isLong),
        ]
      ),
    ],
    {
      value: minExecutionFee.mul(120).div(100),
      // gasLimit: 2000000,
    }
  );
  console.log("tx", tx);
}

main();
