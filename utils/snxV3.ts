import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";

export const getTradeSign = (isLong: boolean, isIncrease: boolean) =>
  isLong === isIncrease ? 1 : -1;
