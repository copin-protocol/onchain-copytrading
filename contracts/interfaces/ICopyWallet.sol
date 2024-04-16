// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ICopyWallet {
    struct CopyWalletConstructorParams {
        address factory;
        address events;
        address configs;
        address usdAsset;
    }

    struct Copytrade {
        uint256 margin;
        uint256 maxMarginPerOI;
        uint256 leverage;
        bool enabled;
    }

    struct Position {
        address trader;
        uint256 lastTraderSize;
        uint256 lastSize;
        uint256 lastSizeDelta;
        uint256 lastPrice;
        uint256 lastFees;
    }

    function VERSION() external view returns (bytes32);

    function lockedFund() external view returns (uint256);

    function lockedFundD18() external view returns (uint256);

    function availableFund() external view returns (uint256);

    function availableFundD18() external view returns (uint256);

    function ethToUsd(uint256 _fee) external view returns (uint256);

    // TODO enable again
    // function checker(
    //     uint256 _taskId
    // ) external view returns (bool canExec, bytes memory execPayload);
    // function getTask(uint256 _taskId) external view returns (Task memory);
    // function executeTask(uint256 _taskId) external;

    function positions(uint256 _key) external view returns (Position memory);

    function init(address _owner) external;
}
