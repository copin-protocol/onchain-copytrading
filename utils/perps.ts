import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
export const calculateAcceptablePrice = (
  marketPrice: BigNumber,
  sizeDelta: BigNumber
) => {
  const oneBN = ethers.utils.parseEther("1");
  const priceImpactDecimalPct = oneBN.div(100);
  return sizeDelta.gt(0)
    ? marketPrice.mul(priceImpactDecimalPct.add(oneBN)).div(oneBN)
    : marketPrice.mul(oneBN.sub(priceImpactDecimalPct)).div(oneBN);
};

export const getTradeSign = (isLong: boolean, isIncrease: boolean) =>
  isLong === isIncrease ? 1 : -1;
