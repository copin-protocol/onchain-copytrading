import { formatEther, parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { abi as copyWalletAbi } from "../../artifacts/contracts/CopyWalletSNXv3.sol/CopyWalletSNXv3.json";
import { Command, SNX_V3_MARKET_IDS, CONFIG } from "../../utils/constants";
import { SNXv3NetworkConfig } from "../../utils/types/config";
import perpsMarketAbi from "../../utils/abis/perpsV3MarketAbi";
import { BigNumber } from "ethers";
import { getTradeSign } from "../../utils/snxV3";
import { getRelaySigner } from "../../utils/relay";
import { calculateAcceptablePrice } from "../../utils/calculate";

const abiDecoder = ethers.utils.defaultAbiCoder;

async function main() {
  const signer = getRelaySigner();

  const demoSource = {
    address: CONFIG.SMART_WALLET_ADDRESS,
    // address: "0x1aA25aBC0f3A29d017638ec9Ba02668921F91016",
  };

  const copyWallet = new ethers.Contract(
    CONFIG.SMART_WALLET_ADDRESS,
    copyWalletAbi,
    signer as any
  );

  const leverage = 8;
  const amount = ethers.utils.parseEther("80");
  const isLong = true;
  const isIncrease = true;
  const sign = getTradeSign(isLong, isIncrease);

  const perps = (network.config as SNXv3NetworkConfig).SNX_PERPS_MARKET;
  const perpsMarket = new ethers.Contract(perps, perpsMarketAbi, signer as any);

  console.log("perps", perps);
  console.log("signer", await signer.getAddress());

  // get account allocated for source trader address + market address
  const accountId = await copyWallet.getAllocatedAccount(
    demoSource.address,
    SNX_V3_MARKET_IDS.ETH
  );
  console.log("accountId", accountId.toString());
  const indexPrice = await perpsMarket.indexPrice("100");
  console.log(indexPrice.toString());

  const sizeDelta = amount
    .mul(leverage)
    .mul(BigNumber.from(10).pow(18))
    .div(indexPrice)
    .mul(sign);

  const commands: Command[] = [];
  const inputs: (string | number)[] = [];

  let totalAmount = amount;
  if (accountId.eq(0)) {
    commands.push(Command.PERP_CREATE_ACCOUNT, Command.PERP_MODIFY_COLLATERAL);
    inputs.push(
      0,
      abiDecoder.encode(
        ["address", "uint256", "int256"],
        [demoSource.address, SNX_V3_MARKET_IDS.ETH, totalAmount]
      )
    );
  } else {
    const position = await perpsMarket.getOpenPosition(
      accountId,
      SNX_V3_MARKET_IDS.ETH
    );
    if (!position.positionSize.eq(0)) {
      totalAmount = (position.positionSize as BigNumber)
        .add(sizeDelta)
        .div(leverage)
        .mul(indexPrice)
        .div(BigNumber.from(10).pow(18))
        .abs();
    }

    if (totalAmount.lte(0)) {
      throw Error("Skipped due to insufficient margin for reduction");
    }

    console.log(
      (position.positionSize as BigNumber)
        .add(sizeDelta)
        .mul(indexPrice)
        .div(BigNumber.from(10).pow(18))
        .toString()
    );

    const ONE = BigNumber.from(10).pow(18);

    const [availableMargin, withdrawableMargin, requiredMargin] =
      await Promise.all([
        perpsMarket.getAvailableMargin(accountId),
        perpsMarket.getWithdrawableMargin(accountId),
        perpsMarket.requiredMarginForOrder(
          accountId,
          SNX_V3_MARKET_IDS.ETH,
          sizeDelta
        ),
      ]);
    const requiredAmount = requiredMargin.mul(105).div(100);

    console.log("totalAmount", formatEther(totalAmount));

    console.log("availableMargin", formatEther(availableMargin));
    console.log("withdrawableMargin", formatEther(withdrawableMargin));
    console.log("requiredAmount", formatEther(requiredAmount));
    if (requiredAmount.gt(totalAmount)) {
      throw Error(
        `This trade size requires a margin of ${formatEther(
          requiredAmount
        )} USD`
      );
    }
    const diff = availableMargin
      .sub(totalAmount)
      .abs()
      .mul(ONE)
      .div(totalAmount);

    if (diff.gt(ONE.div(100))) {
      const diffAmount = totalAmount.sub(availableMargin);
      console.log("diffAmount", formatEther(diffAmount));

      let modifyAmount: BigNumber = BigNumber.from(0);
      if (diffAmount.gt(0)) {
        modifyAmount = diffAmount;
      } else if (withdrawableMargin.gt(0)) {
        modifyAmount = withdrawableMargin.gt(diffAmount.abs())
          ? diffAmount
          : withdrawableMargin.mul(-1);
      }
      if (!modifyAmount.eq(0)) {
        if (modifyAmount.gt(0)) {
          // TODO handle decimals
          const availableFund = (await copyWallet.availableFund())
            .mul(ONE)
            .div(BigNumber.from(10).pow(6));

          console.log(availableFund.toString());
          const idleMargin = await copyWallet.getPerpIdleMargin();
          if (availableFund.add(idleMargin).lt(modifyAmount)) {
            throw Error(
              "The copyWallet fund is insufficient for executing the order"
            );
          } else if (availableFund.lt(modifyAmount)) {
            commands.push(Command.PERP_WITHDRAW_ALL_MARGIN);
            inputs.push(0);
          }
        }
        commands.push(Command.PERP_MODIFY_COLLATERAL);
        inputs.push(
          abiDecoder.encode(
            ["address", "uint256", "int256"],
            [demoSource.address, SNX_V3_MARKET_IDS.ETH, modifyAmount]
          )
        );
      }
      console.log("modifyAmount", formatEther(modifyAmount));
    }
  }

  const fillPrice = await perpsMarket.fillPrice(
    SNX_V3_MARKET_IDS.ETH,
    sizeDelta,
    indexPrice
  );

  console.log("accountId", accountId.toString());
  console.log("indexPrice", formatEther(indexPrice));
  console.log("fillPrice", formatEther(fillPrice));
  console.log("sizeDelta", formatEther(sizeDelta));
  console.log("amount", formatEther(amount));

  commands.push(Command.PERP_PLACE_ORDER);
  inputs.push(
    abiDecoder.encode(
      ["address", "uint256", "int256", "uint256", "address"],
      [
        demoSource.address,
        SNX_V3_MARKET_IDS.ETH,
        sizeDelta,
        calculateAcceptablePrice(fillPrice, sizeDelta.gt(0)),
        demoSource.address,
      ]
    )
  );

  console.log("commands", commands);
  const estimation = await copyWallet.estimateGas.execute(commands, inputs);
  const tx = await copyWallet.execute(commands, inputs, {
    gasLimit: estimation.mul(105).div(100),
  });
  console.log("tx", tx);
}
main();
