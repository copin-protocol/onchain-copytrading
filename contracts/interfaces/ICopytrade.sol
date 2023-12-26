// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ICopytrade {
    enum Command {
        OWNER_MODIFY_FUND, //0
        OWNER_WITHDRAW_ETH, //1
        OWNER_WITHDRAW_TOKEN, //2
        PERP_MODIFY_COLLATERAL, //3
        PERP_PLACE_ORDER, //4
        PERP_CLOSE_ORDER, //5
        GELATO_CREATE_TASK, //6
        GELETO_CANCEL_TASK //7
    }

    enum TaskCommand {
        STOP_ORDER, //0
        LIMIT_ORDER //1
    }

    enum OrderStatus {
        PROCESSING,
        SUCCESS,
        FAILURE
    }

    struct CopytradeConstructorParams {
        address factory;
        address events;
        address configs;
        address usdAsset;
        address trustedForwarder;
        address automate;
        address taskCreator;
    }

    struct Order {
        uint256 size;
        uint256 fee;
        uint256 submittedTime;
        OrderStatus status;
    }

    struct Task {
        bytes32 gelatoTaskId;
        TaskCommand command;
        bytes32 market;
        int256 collateralDelta;
        int256 sizeDelta;
        uint256 triggerPrice;
        uint256 acceptablePrice;
        bytes32 options;
    }

    error LengthMismatch();

    error InvalidCommandType(uint256 commandType);

    error ZeroSizeDelta();

    error InsufficientAvailableFund(uint256 available, uint256 required);

    error EthWithdrawalFailed();

    error FeeHasBeenReleased();

    error NoOrderFound();

    error FeeNotYetReleased();

    error CannotExecuteTask(uint256 taskId, address executor);

    function VERSION() external view returns (bytes32);

    function lockedFund() external view returns (uint256);

    function executorUsdFee(uint256 _fee) external view returns (uint256);

    function availableFund() external view returns (uint256);

    function getTask(uint256 _taskId) external view returns (Task memory);

    function init(address _owner, address _executor) external;

    function execute(
        Command[] calldata _commands,
        bytes[] calldata _inputs
    ) external payable;
}
