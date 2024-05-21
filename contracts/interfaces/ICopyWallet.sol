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

    struct TraderPosition {
        address trader;
        uint32 index;
        uint64 __placeholder;
    }

    struct CopyTrade {
        // slot 1
        uint120 collateral; // 1e6
        uint120 lowestCollateral;
        bool reverse;
        bool enable;
        // slot 2
        uint24 leverage; // 1e3
        uint24 lowestLeverage; // 1e3
        uint16 tpP; // 1e1
        uint16 slP; // 1e1
        uint176 __placeholder;
    }

    function VERSION() external view returns (bytes32);

    function lockedFund() external view returns (uint256);

    function lockedFundD18() external view returns (uint256);

    function availableFund() external view returns (uint256);

    function availableFundD18() external view returns (uint256);

    function init(address _owner) external;
}
