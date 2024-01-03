// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ICopytradeSNX {
    error InvalidPrice();

    struct ConstructorParams {
        address factory;
        address events;
        address configs;
        address usdAsset;
        address automate;
        address taskCreator;
        address perpsMarket;
        address spotMarket;
        address sUSDC;
        address sUSD;
        uint128 ethMarketId;
    }
}
