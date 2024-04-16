// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopyWallet, IEvents} from "./interfaces/IEvents.sol";
import {IFactory} from "./interfaces/IFactory.sol";

contract Events is IEvents {
    /* ========== STATE ========== */

    address public immutable factory;

    /* ========== MODIFIER ========== */

    modifier onlyCopyWallets() {
        if (!IFactory(factory).wallets(msg.sender)) {
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

    function emitChargeExecutorFee(
        address executor,
        address receiver,
        uint256 fee,
        uint256 feeUsd
    ) external override onlyCopyWallets {
        emit ChargeExecutorFee({
            executor: executor,
            receiver: receiver,
            wallet: msg.sender,
            fee: fee,
            feeUsd: feeUsd
        });
    }

    function emitChargeProtocolFee(
        address receiver,
        uint256 sizeDelta,
        uint256 price,
        uint256 feeUsd
    ) external override onlyCopyWallets {
        emit ChargeProtocolFee({
            receiver: receiver,
            wallet: msg.sender,
            sizeDelta: sizeDelta,
            price: price,
            feeUsd: feeUsd
        });
    }
}
