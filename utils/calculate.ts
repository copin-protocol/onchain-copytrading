import { BigNumber, ethers } from "ethers";

export const calculateAcceptablePrice = (
  marketPrice: BigNumber,
  sizeDeltaPos: boolean
) => {
  const oneBN = ethers.utils.parseEther("1");
  const priceImpactDecimalPct = oneBN.div(100);
  return sizeDeltaPos
    ? marketPrice.mul(priceImpactDecimalPct.add(oneBN)).div(oneBN)
    : marketPrice.mul(oneBN.sub(priceImpactDecimalPct)).div(oneBN);
};
