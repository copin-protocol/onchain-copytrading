// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopyWallet} from "./ICopyWallet.sol";

interface IEvents {
    error OnlyCopyWallets();

    function factory() external view returns (address);

    function emitDeposit(address user, uint256 amount) external;

    event Deposit(address indexed user, address indexed wallet, uint256 amount);

    function emitWithdraw(address user, uint256 amount) external;

    event Withdraw(
        address indexed user,
        address indexed wallet,
        uint256 amount
    );

    function emitEthWithdraw(address user, uint256 amount) external;

    event EthWithdraw(
        address indexed user,
        address indexed wallet,
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
        address indexed wallet,
        uint256 fee,
        uint256 feeUsd
    );

    function emitChargeProtocolFee(
        address receiver,
        uint256 sizeDelta,
        uint256 price,
        uint256 feeUsd
    ) external;

    event ChargeProtocolFee(
        address indexed receiver,
        address indexed wallet,
        uint256 sizeDelta,
        uint256 price,
        uint256 feeUsd
    );
}
