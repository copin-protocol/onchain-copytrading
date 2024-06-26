import { ethers } from "hardhat";
import marketAbi from "../../utils/abis/perpsV2MarketAbi";
import { CONFIG } from "../../utils/constants";

async function main() {
  const [, wallet2] = await ethers.getSigners();
  const market = "0xa35575182f5985d6caA1E4e435e7EaF986232ef8";
  const perp = new ethers.Contract(market, marketAbi, wallet2 as any);

  // const orderInfo = await perp.orderFee(
  //   ethers.utils.parseEther("0.01").mul(-1),
  //   2
  // );
  // console.log("orderInfo", orderInfo);

  const price = await perp.assetPrice();
  console.log(ethers.utils.formatEther(price.price), price);
  const key = await perp.marketKey();
  console.log("key", key);
  const accessibleMargin = await perp.accessibleMargin(
    CONFIG.SMART_WALLET_ADDRESS
  );
  console.log(
    "accessibleMargin",
    ethers.utils.formatEther(accessibleMargin.marginAccessible),
    accessibleMargin.invalid
  );
  const remainingMargin = await perp.remainingMargin(
    CONFIG.SMART_WALLET_ADDRESS
  );
  console.log(
    "remainingMargin",
    ethers.utils.formatEther(remainingMargin.marginRemaining)
  );
  const position = await perp.positions(CONFIG.SMART_WALLET_ADDRESS);
  console.log(
    "position",
    Object.entries(position).map(([key, value]: any[]) => ({
      [key]: ethers.utils.formatEther(value),
    }))
  );

  const delayedOrder = await perp.delayedOrders(CONFIG.SMART_WALLET_ADDRESS);
  console.log(
    "delayedOrder",
    Object.entries(delayedOrder).map(([key, value]: any[]) => {
      let val = value;
      try {
        val = ethers.utils.formatEther(value);
      } catch (err) {}
      return {
        [key]: val,
      };
    })
  );

  // const tx = await perp.transferMargin(utils.parseEther("50"));
  // const tx = await perp.withdrawAllMargin();
  // console.log(tx);
}

main();
