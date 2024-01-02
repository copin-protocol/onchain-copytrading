import { ethers, network } from "hardhat";
import perpsMarketAbi from "../utils/abis/perpsMarketAbi";
import spotMarketAbi from "../utils/abis/spotMarketAbi";
import { BigNumber, Event } from "ethers";
import { abi as mockERC20Abi } from "../artifacts/contracts/test/MockERC20.sol/MockERC20.json";
import { CopinNetworkConfig } from "../utils/types/config";

export const DEFAULT_FUNDS = ethers.utils.parseEther("100");

async function main() {
  const [wallet1, wallet2, wallet3] = await ethers.getSigners();
  const perps = (network.config as CopinNetworkConfig).SNX_PERPS_MARKET;
  const spot = (network.config as CopinNetworkConfig).SNX_SPOT_MARKET;
  const perpsMarket = new ethers.Contract(
    perps,
    perpsMarketAbi,
    wallet2 as any
  );
  const spotMarket = new ethers.Contract(spot, spotMarketAbi, wallet2 as any);
}

main();
