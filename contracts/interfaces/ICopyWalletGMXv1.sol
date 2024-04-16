// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ICopyWalletGMXv1 {
    error ExecutionFeeNotEnough();
    struct ConstructorParams {
        address factory;
        address events;
        address configs;
        address usdAsset;
        address router;
        address positionRouter;
        address vault;
        address weth;
    }
}
