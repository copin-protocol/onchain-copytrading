// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ICopyWallet {
    struct CopyWalletConstructorParams {
        address factory;
        address events;
        address configs;
        address usdAsset;
        address gainsTrading;
    }

    function VERSION() external view returns (bytes32);

    function lockedFund() external view returns (uint256);

    function lockedFundD18() external view returns (uint256);

    function availableFund() external view returns (uint256);

    function availableFundD18() external view returns (uint256);

    function init(address _owner) external;
}
