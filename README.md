# OnChain-CopyTrading

This repository contains the smart contracts for the decentralized copytrading protocol by Copin

Try running some of the following tasks:

```shell
npm run compile
npm run deploy:snx:opSepolia
npm run verify:snx:opSepolia
npx hardhat run --network goerli scripts/deposit1Balance.ts
npx hardhat run --network testnet scripts/newCopyWallet.ts
npx hardhat run --network testnet scripts/modifyFund.ts
npx hardhat run --network testnet scripts/SNXv2/relayPlaceOrder.ts
npx hardhat run --network testnet scripts/SNXv2/relayCloseOrder.ts
```
