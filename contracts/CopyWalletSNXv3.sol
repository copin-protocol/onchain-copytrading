// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopyWallet} from "./interfaces/ICopyWallet.sol";
import {IConfigs} from "./interfaces/IConfigs.sol";
import {ICopyWalletSNXv3} from "./interfaces/ICopyWalletSNXv3.sol";
import {IPerpsMarket} from "./interfaces/SNXv3/IPerpsMarket.sol";
import {ISpotMarket} from "./interfaces/SNXv3/ISpotMarket.sol";
import {IERC20} from "./interfaces/token/IERC20.sol";
import {CopyWallet} from "./core/CopyWallet.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract CopyWalletSNXv3 is CopyWallet, ICopyWalletSNXv3, ERC721Holder {
    IPerpsMarket internal immutable PERPS_MARKET;
    ISpotMarket internal immutable SPOT_MARKET;
    IERC20 internal immutable SUSDC;
    IERC20 internal immutable SUSD;
    uint128 internal immutable ETH_MARKET_ID;
    uint128[] public accountIds;

    mapping(bytes32 => uint128) internal _keyAccounts;
    mapping(uint128 => Order) internal _accountOrders;

    constructor(
        ConstructorParams memory _params
    )
        CopyWallet(
            ICopyWallet.CopyWalletConstructorParams({
                factory: _params.factory,
                events: _params.events,
                configs: _params.configs,
                usdAsset: _params.usdAsset,
                automate: _params.automate,
                taskCreator: _params.taskCreator
            })
        )
    {
        PERPS_MARKET = IPerpsMarket(_params.perpsMarket);
        SPOT_MARKET = ISpotMarket(_params.spotMarket);
        SUSDC = IERC20(_params.sUSDC);
        SUSD = IERC20(_params.sUSD);
        ETH_MARKET_ID = _params.ethMarketId;
    }

    function closePosition(
        uint128 _accountId,
        uint256 _market,
        uint256 _acceptablePrice
    )
        external
        returns (IPerpsMarket.AsyncOrderData memory retOrder, uint256 fees)
    {
        if (!isAuth(msg.sender)) revert Unauthorized();
        return _perpClosePosition(_accountId, _market, _acceptablePrice);
    }

    /* ========== VIEWS ========== */

    function ethToUsd(uint256 _amount) public view override returns (uint256) {
        return _tokenToUsd(_amount, ETH_MARKET_ID);
    }

    function hasPerpPermission(
        uint128 accountId,
        bytes32 permission
    ) external view returns (bool) {
        return PERPS_MARKET.hasPermission(accountId, permission, address(this));
    }

    function isPerpAuthorized(
        uint128 accountId,
        bytes32 permission
    ) external view returns (bool) {
        return PERPS_MARKET.isAuthorized(accountId, permission, address(this));
    }

    function getAccountOrder(
        uint128 _accountId
    ) public view returns (Order memory order) {
        order = _accountOrders[_accountId];
    }

    function accountIdle(uint128 _accountId) public view returns (bool) {
        return _perpAccountIdle(_accountId);
    }

    function accountIdleByIndex(uint256 _index) public view returns (bool) {
        uint128 accountId = accountIds[_index];
        return accountIdle(accountId);
    }

    function numOfAccounts() external view returns (uint256) {
        return accountIds.length;
    }

    function getKeyAccount(
        address _source,
        uint256 _market
    ) external view returns (uint128) {
        bytes32 key = keccak256(abi.encodePacked(_source, _market));
        return _keyAccounts[key];
    }

    function getAllocatedAccount(
        address _source,
        uint256 _market
    ) public view returns (uint128) {
        bytes32 key = keccak256(abi.encodePacked(_source, _market));
        uint128 accountId = _keyAccounts[key];
        Order memory order = _accountOrders[accountId];
        if (
            accountId != 0 && order.source == _source && order.market == _market
        ) return accountId;
        for (uint i = 0; i < accountIds.length; i++) {
            uint128 iAccountId = accountIds[i];
            if (accountIdle(iAccountId)) return iAccountId;
        }
        return 0;
    }

    function getOpenPosition(
        address _source,
        uint256 _market
    )
        public
        view
        returns (uint128 accountId, int256 size, int256 pnl, int256 funding)
    {
        bytes32 key = keccak256(abi.encodePacked(_source, _market));
        return _perpGetOpenPosition(_keyAccounts[key], _market);
    }

    function getOrder(
        address _source,
        uint256 _market
    ) public view returns (Order memory order) {
        bytes32 key = keccak256(abi.encodePacked(_source, _market));
        uint128 accountId = _keyAccounts[key];
        order = _accountOrders[accountId];
    }

    function getPerpIdleMargin() external view returns (int256 margin) {
        for (uint i = 0; i < accountIds.length; i++) {
            uint128 accountId = accountIds[i];
            if (accountIdle(accountId)) {
                margin += PERPS_MARKET.getAvailableMargin(accountId);
            }
        }
    }

    function getPerpMargin() external view returns (int256 margin) {
        for (uint i = 0; i < accountIds.length; i++) {
            uint128 accountId = accountIds[i];
            margin += PERPS_MARKET.getAvailableMargin(accountId);
        }
    }

    /* ========== PERPS ========== */

    function _perpInit() internal override {
        _perpCreateAccount();
    }

    function _perpCreateAccount() internal override {
        uint128 accountId = PERPS_MARKET.createAccount();
        PERPS_MARKET.grantPermission({
            accountId: accountId,
            permission: "ADMIN",
            user: address(this)
        });
        accountIds.push(accountId);
    }

    function _perpModifyCollateral(bytes calldata _inputs) internal override {
        address source;
        uint128 marketId;
        int256 amount;
        assembly {
            source := calldataload(_inputs.offset)
            marketId := calldataload(add(_inputs.offset, 0x20))
            amount := calldataload(add(_inputs.offset, 0x40))
        }
        uint128 accountId = _allocatedAccount(source, uint256(marketId));
        _modifyCollateral(accountId, amount);
    }

    function _perpPlaceOrder(bytes calldata _inputs) internal override {
        address source;
        uint128 marketId;
        int128 sizeDelta;
        uint256 acceptablePrice;
        address referrer;
        assembly {
            source := calldataload(_inputs.offset)
            marketId := calldataload(add(_inputs.offset, 0x20))
            sizeDelta := calldataload(add(_inputs.offset, 0x40))
            acceptablePrice := calldataload(add(_inputs.offset, 0x60))
            referrer := calldataload(add(_inputs.offset, 0x80))
        }
        if (sizeDelta == 0) revert ZeroSizeDelta();
        uint128 accountId = _allocatedAccount(source, uint256(marketId));
        bytes32 key = keccak256(abi.encodePacked(source, uint256(marketId)));
        _keyAccounts[key] = accountId;
        _placeOrder({
            _source: source,
            _marketId: marketId,
            _accountId: accountId,
            _sizeDelta: sizeDelta,
            _acceptablePrice: acceptablePrice,
            _referrer: referrer
        });
    }

    function _perpCloseOrder(bytes calldata _inputs) internal override {
        address source;
        uint128 marketId;
        uint256 acceptablePrice;
        address referrer;
        assembly {
            source := calldataload(_inputs.offset)
            marketId := calldataload(add(_inputs.offset, 0x20))
            acceptablePrice := calldataload(add(_inputs.offset, 0x40))
            referrer := calldataload(add(_inputs.offset, 0x60))
        }
        uint128 accountId = _allocatedAccount(source, uint256(marketId));
        _placeOrder({
            _source: source,
            _marketId: marketId,
            _accountId: accountId,
            _sizeDelta: 0, // sizeDelta 0 = close position
            _acceptablePrice: acceptablePrice,
            _referrer: referrer
        });
    }

    function _perpCancelOrder(bytes calldata _inputs) internal override {
        address source;
        uint128 marketId;
        assembly {
            source := calldataload(_inputs.offset)
            marketId := calldataload(add(_inputs.offset, 0x20))
        }
        uint128 accountId = _allocatedAccount(source, uint256(marketId));
        PERPS_MARKET.cancelOrder(accountId);
    }

    function _perpClosePosition(
        uint128 _accountId,
        uint256 _market,
        uint256 _acceptablePrice
    )
        internal
        returns (IPerpsMarket.AsyncOrderData memory retOrder, uint256 fees)
    {
        return
            _placeOrder({
                _source: _accountOrders[_accountId].source,
                _marketId: uint128(_market),
                _accountId: _accountId,
                _sizeDelta: 0, // sizeDelta 0 = close position
                _acceptablePrice: _acceptablePrice,
                _referrer: address(0)
            });
    }

    function _perpWithdrawAllMargin(bytes calldata _inputs) internal override {
        for (uint i = 0; i < accountIds.length; i++) {
            uint128 accountId = accountIds[i];
            if (accountIdle(accountId)) {
                int256 margin = PERPS_MARKET.getAvailableMargin(accountId);
                _modifyCollateral(accountId, -margin);
            }
        }
    }

    // TODO enable again
    // function _perpValidTask(
    //     Task memory _task
    // ) internal view override returns (bool) {
    //     uint256 price = _indexPrice(_getMarketId(_task.market));
    //     if (_task.command == TaskCommand.STOP_ORDER) {
    //         if (_task.sizeDelta > 0) {
    //             // Long: increase position size (buy) once *above* trigger price
    //             // ex: unwind short position once price is above target price (prevent further loss)
    //             return price >= _task.triggerPrice;
    //         } else {
    //             // Short: decrease position size (sell) once *below* trigger price
    //             // ex: unwind long position once price is below trigger price (prevent further loss)
    //             return price <= _task.triggerPrice;
    //         }
    //     } else if (_task.command == TaskCommand.LIMIT_ORDER) {
    //         if (_task.sizeDelta > 0) {
    //             // Long: increase position size (buy) once *below* trigger price
    //             // ex: open long position once price is below trigger price
    //             return price <= _task.triggerPrice;
    //         } else {
    //             // Short: decrease position size (sell) once *above* trigger price
    //             // ex: open short position once price is above trigger price
    //             return price >= _task.triggerPrice;
    //         }
    //     }
    //     return false;
    // }
    // function _perpExecuteTask(
    //     uint256 _taskId,
    //     Task memory _task
    // ) internal override {
    //     uint128 accountId = _allocatedAccount(_task.source, _task.market);

    //     if (_task.command == TaskCommand.STOP_ORDER) {
    //         (, , int128 lastSize) = PERPS_MARKET.getOpenPosition(
    //             accountId,
    //             uint128(_task.market)
    //         );
    //         if (lastSize == 0 || _isSameSign(lastSize, _task.sizeDelta)) {
    //             EVENTS.emitCancelGelatoTask({
    //                 taskId: _taskId,
    //                 gelatoTaskId: _task.gelatoTaskId,
    //                 reason: "INVALID_SIZE"
    //             });
    //             return;
    //         }
    //         if (_abs(_task.sizeDelta) > _abs(lastSize)) {
    //             // bound conditional order size delta to current position size
    //             _task.sizeDelta = -lastSize;
    //         }
    //     }
    //     // if margin was locked, free it
    //     if (_task.collateralDelta > 0) {
    //         lockedFund -= _abs(_task.collateralDelta);
    //     }
    //     if (_task.collateralDelta != 0) {
    //         _modifyCollateral(accountId, _task.collateralDelta);
    //     }
    //     _placeOrder({
    //         _source: _task.source,
    //         _marketId: uint128(_task.market),
    //         _accountId: accountId,
    //         _sizeDelta: int128(_task.sizeDelta),
    //         _acceptablePrice: _task.acceptablePrice,
    //         _referrer: _task.referrer
    //     });
    // }

    function _modifyCollateral(uint128 accountId, int256 amount) internal {
        uint256 usdcAmount = _d18ToUsd(_abs(amount));
        if (amount > 0) {
            USD_ASSET.approve(address(SPOT_MARKET), usdcAmount);
            SPOT_MARKET.wrap(1, usdcAmount, uint256(amount)); // USDC -> sUSDC
            SUSDC.approve(address(SPOT_MARKET), uint256(amount));
            SPOT_MARKET.sell(
                1,
                uint256(amount),
                uint256(amount),
                CONFIGS.feeReceiver()
            ); // sUSDC -> USDC
            SUSD.approve(address(PERPS_MARKET), uint256(amount));
        }
        PERPS_MARKET.modifyCollateral(accountId, 0, amount);
        if (amount < 0) {
            SUSD.approve(address(SPOT_MARKET), _abs(amount));
            SPOT_MARKET.buy(
                1,
                _abs(amount),
                _abs(amount),
                CONFIGS.feeReceiver()
            ); // sUSD -> sUSDC
            SUSDC.approve(address(SPOT_MARKET), _abs(amount));
            SPOT_MARKET.unwrap(1, _abs(amount), usdcAmount); // sUSDC -> USDC
        }
    }

    function _placeOrder(
        address _source,
        uint128 _marketId,
        uint128 _accountId,
        int128 _sizeDelta,
        uint256 _acceptablePrice,
        address _referrer
    )
        internal
        returns (IPerpsMarket.AsyncOrderData memory retOrder, uint256 fees)
    {
        (, , int128 lastSize) = PERPS_MARKET.getOpenPosition(
            _accountId,
            _marketId
        );
        // close
        if (_sizeDelta == 0) {
            _sizeDelta = -lastSize;
        } else if (
            !_isSameSign(_sizeDelta, lastSize) &&
            _abs(_sizeDelta) > _abs(lastSize)
        ) {
            // reduce only
            _sizeDelta = -lastSize;
        }

        bool isIncrease = lastSize == 0 || _isSameSign(lastSize, _sizeDelta);
        uint256 price = _indexPrice(_marketId);

        (retOrder, fees) = PERPS_MARKET.commitOrder(
            IPerpsMarket.OrderCommitmentRequest({
                marketId: _marketId,
                accountId: _accountId,
                sizeDelta: _sizeDelta,
                settlementStrategyId: 0,
                acceptablePrice: _acceptablePrice,
                trackingCode: TRACKING_CODE,
                referrer: _referrer == address(0)
                    ? IConfigs(CONFIGS).feeReceiver()
                    : _referrer
            })
        );

        _accountOrders[_accountId] = Order({
            market: _marketId,
            source: _source,
            commitmentBlock: block.number
        });

        _postOrder({
            _id: uint256(_accountId),
            _source: _source,
            _lastSize: _abs(lastSize),
            _sizeDelta: _abs(_sizeDelta),
            _price: price,
            _isIncrease: isIncrease
        });
    }

    function _perpGetOpenPosition(
        uint128 _accountId,
        uint256 _market
    )
        internal
        view
        returns (uint128 accountId, int256 size, int256 pnl, int256 funding)
    {
        accountId = _accountId;
        (pnl, funding, size) = IPerpsMarket(PERPS_MARKET).getOpenPosition(
            _accountId,
            uint128(_market)
        );
    }

    function _perpAccountIdle(uint128 _accountId) internal view returns (bool) {
        Order memory order = _accountOrders[_accountId];
        if (order.market == 0) return true;
        (, , int128 size) = IPerpsMarket(PERPS_MARKET).getOpenPosition(
            _accountId,
            uint128(order.market)
        );
        // lock 3 blocks
        if (size == 0 && block.number > order.commitmentBlock + 3) return true;
        return false;
    }

    /* ========== UTILITIES ========== */

    function _allocatedAccount(
        address _source,
        uint256 _market
    ) internal view returns (uint128 accountId) {
        accountId = getAllocatedAccount(_source, _market);
        if (accountId == 0) revert NoAccountAvailable();
    }

    function _getMarketId(uint256 _market) internal pure returns (uint128) {
        return uint128(_market);
    }

    function _indexPrice(uint128 _marketId) internal view returns (uint256) {
        return IPerpsMarket(PERPS_MARKET).indexPrice(_marketId);
    }

    function _tokenToUsd(
        uint256 _tokenAmount,
        uint128 _marketId
    ) internal view returns (uint256) {
        // ETH: 100
        return _d18ToUsd((_tokenAmount * _indexPrice(_marketId)) / 10 ** 18);
    }
}
