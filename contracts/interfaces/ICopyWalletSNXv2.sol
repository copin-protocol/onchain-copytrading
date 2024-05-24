// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IPerpsV2MarketConsolidated} from "contracts/interfaces/SNXv2/IPerpsV2MarketConsolidated.sol";

interface ICopyWalletSNXv2 {
    error InvalidPrice();

    struct ConstructorParams {
        address factory;
        address events;
        address configs;
        address usdAsset;
        address automate;
        address taskCreator;
        address exchangeRate;
        address marketManager;
        address systemStatus;
    }
}
