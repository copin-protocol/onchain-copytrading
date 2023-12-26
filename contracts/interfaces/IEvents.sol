// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopytrade} from "./ICopytrade.sol";

interface IEvents {
    error OnlyCopytrades();

    function factory() external view returns (address);

    function emitDeposit(address user, uint256 amount) external;

    event Deposit(
        address indexed user,
        address indexed account,
        uint256 amount
    );

    function emitWithdraw(address user, uint256 amount) external;

    event Withdraw(
        address indexed user,
        address indexed account,
        uint256 amount
    );

    function emitEthWithdraw(address user, uint256 amount) external;

    event EthWithdraw(
        address indexed user,
        address indexed account,
        uint256 amount
    );

    function emitChargeExecutorFee(
        address executor,
        address receiver,
        uint256 fee,
        uint256 feeUsd
    ) external;

    event ChargeExecutorFee(
        address indexed executor,
        address indexed receiver,
        address indexed account,
        uint256 fee,
        uint256 feeUsd
    );

    function emitChargeProtocolFee(
        address receiver,
        uint256 sizeUsd,
        uint256 feeUsd
    ) external;

    event ChargeProtocolFee(
        address indexed receiver,
        address indexed account,
        uint256 sizeUsd,
        uint256 feeUsd
    );

    function emitCreateGelatoTask(
        uint256 taskId,
        bytes32 gelatoTaskId,
        ICopytrade.TaskCommand command,
        bytes32 market,
        int256 collateralDelta,
        int256 sizeDelta,
        uint256 triggerPrice,
        uint256 acceptablePrice,
        bytes32 options
    ) external;

    event CreateGelatoTask(
        address indexed account,
        uint256 indexed taskId,
        bytes32 indexed gelatoTaskId,
        ICopytrade.TaskCommand command,
        bytes32 market,
        int256 collateralDelta,
        int256 sizeDelta,
        uint256 triggerPrice,
        uint256 acceptablePrice,
        bytes32 options
    );

    function emitGelatoTaskRunned(
        uint256 taskId,
        bytes32 gelatoTaskId,
        uint256 fillPrice,
        uint256 fee
    ) external;

    event GelatoTaskRunned(
        address indexed account,
        uint256 indexed taskId,
        bytes32 indexed gelatoTaskId,
        uint256 fillPrice,
        uint256 fee
    );

    function emitGelatoTaskCanceled(
        uint256 taskId,
        bytes32 gelatoTaskId,
        bytes32 reason
    ) external;

    event GelatoTaskCanceled(
        address indexed account,
        uint256 indexed taskId,
        bytes32 indexed gelatoTaskId,
        bytes32 reason
    );
}
