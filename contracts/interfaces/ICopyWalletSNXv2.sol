// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IPerpsV2MarketConsolidated} from "contracts/interfaces/SNXv2/IPerpsV2MarketConsolidated.sol";

interface ICopyWalletSNXv2 {
    struct ConstructorParams {
        address factory;
        address events;
        address configs;
        address usdAsset;
        address exchangeRate;
        address marketManager;
        address systemStatus;
    }
}
