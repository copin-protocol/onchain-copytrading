// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopytrade, IEvents} from "./interfaces/IEvents.sol";
import {IFactory} from "./interfaces/IFactory.sol";

contract Events is IEvents {
    address public immutable factory;

    modifier onlyCopytrades() {
        if (!IFactory(factory).accounts(msg.sender)) {
            revert OnlyCopytrades();
        }
        _;
    }

    constructor(address _factory) {
        factory = _factory;
    }

    function emitDeposit(
        address user,
        uint256 amount
    ) external override onlyCopytrades {
        emit Deposit({user: user, account: msg.sender, amount: amount});
    }

    function emitWithdraw(
        address user,
        uint256 amount
    ) external override onlyCopytrades {
        emit Withdraw({user: user, account: msg.sender, amount: amount});
    }

    function emitEthWithdraw(
        address user,
        uint256 amount
    ) external override onlyCopytrades {
        emit EthWithdraw({user: user, account: msg.sender, amount: amount});
    }

    function emitChargeExecutorFee(
        address executor,
        address receiver,
        uint256 fee,
        uint256 feeUsd
    ) external override onlyCopytrades {
        emit ChargeExecutorFee({
            executor: executor,
            receiver: receiver,
            account: msg.sender,
            fee: fee,
            feeUsd: feeUsd
        });
    }

    function emitChargeProtocolFee(
        address receiver,
        uint256 sizeDelta,
        uint256 price,
        uint256 feeUsd
    ) external override onlyCopytrades {
        emit ChargeProtocolFee({
            receiver: receiver,
            account: msg.sender,
            sizeDelta: sizeDelta,
            price: price,
            feeUsd: feeUsd
        });
    }

    function emitCreateGelatoTask(
        uint256 taskId,
        bytes32 gelatoTaskId,
        ICopytrade.TaskCommand command,
        address source,
        uint256 market,
        int256 collateralDelta,
        int256 sizeDelta,
        uint256 triggerPrice,
        uint256 acceptablePrice,
        address referrer
    ) external override onlyCopytrades {
        emit CreateGelatoTask({
            copytrade: msg.sender,
            taskId: taskId,
            gelatoTaskId: gelatoTaskId,
            command: command,
            source: source,
            market: market,
            collateralDelta: collateralDelta,
            sizeDelta: sizeDelta,
            triggerPrice: triggerPrice,
            acceptablePrice: acceptablePrice,
            referrer: referrer
        });
    }

    function emitUpdateGelatoTask(
        uint256 taskId,
        bytes32 gelatoTaskId,
        int256 collateralDelta,
        int256 sizeDelta,
        uint256 triggerPrice,
        uint256 acceptablePrice
    ) external override onlyCopytrades {
        emit UpdateGelatoTask({
            copytrade: msg.sender,
            taskId: taskId,
            gelatoTaskId: gelatoTaskId,
            collateralDelta: collateralDelta,
            sizeDelta: sizeDelta,
            triggerPrice: triggerPrice,
            acceptablePrice: acceptablePrice
        });
    }

    function emitCancelGelatoTask(
        uint256 taskId,
        bytes32 gelatoTaskId,
        bytes32 reason
    ) external override onlyCopytrades {
        emit CancelGelatoTask({
            copytrade: msg.sender,
            taskId: taskId,
            gelatoTaskId: gelatoTaskId,
            reason: reason
        });
    }

    function emitGelatoTaskRunned(
        uint256 taskId,
        bytes32 gelatoTaskId,
        uint256 fillPrice,
        uint256 fee
    ) external override onlyCopytrades {
        emit GelatoTaskRunned({
            account: msg.sender,
            taskId: taskId,
            gelatoTaskId: gelatoTaskId,
            fillPrice: fillPrice,
            fee: fee
        });
    }
}
