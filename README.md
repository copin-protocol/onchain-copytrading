# OnChain-CopyTrading

This repository contains the smart contracts for the decentralized copytrading protocol by Copin

Try running some of the following tasks:

```shell
npm run compile
npm run test
npm run deploy:snx:testnet
npx hardhat run --network goerli scripts/deposit1Balance.ts
npx hardhat run --network testnet scripts/newCopytrade.ts
npx hardhat run --network testnet scripts/modifyFund.ts
npx hardhat run --network testnet scripts/relayPlaceOrder.ts
npx hardhat run --network testnet scripts/relayCloseOrder.ts
npx hardhat run --network testnet scripts/relayCreateTask.ts
npx hardhat run --network testnet scripts/relayCancelTask.ts
```
