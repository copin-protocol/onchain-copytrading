import { formatEther, parseEther } from "@ethersproject/units";
import { JsonRpcProvider } from "@ethersproject/providers";
// 0x81f6db11736589eab14b59c5251c27482e6c7c12
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

export const DEFAULT_MARGIN = ethers.utils.parseEther("90");

const abiDecoder = ethers.utils.defaultAbiCoder;

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

  // client.relay.create;

  const [wallet1, wallet2, wallet3] = await ethers.getSigners();
  const copytrade = new ethers.Contract(
    SMART_COPYTRADE_ADDRESS,
    copytradeAbi,
    signer as any
  );

  const perps = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const spot = (network.config as CopinNetworkConfig).SNX_SPOT_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);
  const spotMarket = new ethers.Contract(spot, spotMarketAbi, signer as any);

  const indexPrice = await perpsMarket.indexPrice(100);

  const size = DEFAULT_MARGIN.mul(BigNumber.from(10).pow(18)).div(indexPrice);

  // const accountId = await copytrade.allocatedAccount(
  //   wallet1.address,
  //   100,
  //   false
  // );
  // const position = await perpsMarket.getOpenPosition(accountId, 100);
  // const size = position.positionSize.mul(-1);

  const fillPrice = await perpsMarket.fillPrice(100, size, indexPrice);

  console.log("indexPrice", formatEther(indexPrice));
  console.log("fillPrice", formatEther(fillPrice));

  console.log("size", size.toString());
  const commands = [Command.PERP_PLACE_ORDER];
  const inputs = [
    abiDecoder.encode(
      ["address", "uint256", "uint256", "int256", "uint256", "address"],
      [
        wallet3.address,
        100,
        0,
        size,
        calculateAcceptablePrice(fillPrice, size),
        wallet3.address,
      ]
    ),
  ];
  const tx = await copytrade.execute(commands, inputs, {
    gasLimit: 2_000_000,
  });
  console.log("tx", tx);

  // const txs = await Promise.all([
  //   copytrade.testRelay(),
  //   copytrade.testRelay(),
  //   copytrade.testRelay(),
  //   copytrade.testRelay(),
  //   copytrade.testRelay(),
  //   copytrade.testRelay(),
  //   copytrade.testRelay(),
  //   copytrade.testRelay(),
  //   copytrade.testRelay(),
  //   copytrade.testRelay(),
  // ]);
  // console.log(
  //   "txs",
  //   txs.map((t) => t.hash)
  // );

  // const commands = [Command.PERP_CLOSE_ORDER];
  // const inputs = [
  //   abiDecoder.encode(
  //     ["address", "uint256", "uint256", "uint256", "address"],
  //     [
  //       wallet1.address,
  //       100,
  //       accountId,
  //       calculateAcceptablePrice(fillPrice, size),
  //       wallet1.address,
  //     ]
  //   ),
  // ];
  // const tx = await copytrade.execute(commands, inputs, {
  //   gasLimit: 2_000_000,
  // });
  // console.log("tx", tx);
}
main();
