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

    function emitChargeProtocolFee(address receiver, uint256 feeUsd) external;

    event ChargeProtocolFee(
        address indexed wallet,
        address receiver,
        uint256 feeUsd
    );
}
