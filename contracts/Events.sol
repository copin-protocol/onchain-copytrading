// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopyWallet, IEvents} from "./interfaces/IEvents.sol";
import {IFactory} from "./interfaces/IFactory.sol";

contract Events is IEvents {
    /* ========== STATE ========== */

    address public immutable factory;

    /* ========== MODIFIER ========== */

    modifier onlyCopyWallets() {
        if (!IFactory(factory).accounts(msg.sender)) {
            revert OnlyCopyWallets();
        }
        _;
    }

    /* ========== CONSTRUCTOR ========== */

    constructor(address _factory) {
        factory = _factory;
    }

    /* ========== EMIT ========== */

    function emitDeposit(
        address user,
        uint256 amount
    ) external override onlyCopyWallets {
        emit Deposit({user: user, wallet: msg.sender, amount: amount});
    }

    function emitWithdraw(
        address user,
        uint256 amount
    ) external override onlyCopyWallets {
        emit Withdraw({user: user, wallet: msg.sender, amount: amount});
    }

    function emitEthWithdraw(
        address user,
        uint256 amount
    ) external override onlyCopyWallets {
        emit EthWithdraw({user: user, wallet: msg.sender, amount: amount});
    }

    function emitChargeProtocolFee(
        address receiver,
        uint256 feeUsd
    ) external override onlyCopyWallets {
        emit ChargeProtocolFee({
            wallet: msg.sender,
            receiver: receiver,
            feeUsd: feeUsd
        });
    }

    function emitSetCopyTrade(
        address trader,
        ICopyWallet.CopyTrade memory copyTrade
    ) external override onlyCopyWallets {
        emit SetCopyTrade({
            wallet: msg.sender,
            trader: trader,
            copyTrade: copyTrade
        });
    }

    function emitRegisterSignal(
        string memory name,
        uint256 signalId
    ) external override onlyCopyWallets {
        emit RegisterSignal({
            wallet: msg.sender,
            name: name,
            signalId: signalId
        });
    }
}
