// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ICopyWalletSNXv3 {
    error NoAccountAvailable();
    error AccountMismatch();
    error AccountUnavailable();
    error KeyWrong();
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

    struct Order {
        uint128 market;
        address source;
        uint256 commitmentBlock;
    }

    function getAllocatedAccount(
        address _source,
        uint256 _market
    ) external view returns (uint128);

    function getOpenPosition(
        address _source,
        uint256 _market
    )
        external
        view
        returns (uint128 accountId, int256 size, int256 pnl, int256 funding);
}
