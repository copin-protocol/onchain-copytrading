// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ICopyWalletGMXv2 {
    error ExecutionFeeNotEnough();
    struct ConstructorParams {
        address factory;
        address events;
        address configs;
        address usdAsset;
        address automate;
        address taskCreator;
        address router;
        address positionRouter;
        address vault;
        address weth;
    }
}
