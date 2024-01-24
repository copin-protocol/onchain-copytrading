// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopytrade} from "./interfaces/ICopytrade.sol";
import {IConfigs} from "./interfaces/IConfigs.sol";
import {ICopytradeSNX} from "./interfaces/ICopytradeSNX.sol";
import {IPerpsMarket} from "./interfaces/synthetix/IPerpsMarket.sol";
import {ISpotMarket} from "./interfaces/synthetix/ISpotMarket.sol";
import {IERC20} from "./interfaces/token/IERC20.sol";
import {Copytrade} from "./core/Copytrade.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract CopytradeSNX is Copytrade, ICopytradeSNX, ERC721Holder {
    IPerpsMarket internal immutable PERPS_MARKET;
    ISpotMarket internal immutable SPOT_MARKET;
    IERC20 internal immutable SUSDC;
    IERC20 internal immutable SUSD;
    uint128 internal immutable ETH_MARKET_ID;

    constructor(
        ConstructorParams memory _params
    )
        Copytrade(
            ICopytrade.CopytradeConstructorParams({
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

    function executorUsdFee(
        uint256 _fee
    ) public view override returns (uint256) {
        return _tokenToUsd(_fee, ETH_MARKET_ID);
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
        override
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
                _modifyCollateral(accountId, margin * -1);
            }
        }
    }

    function _perpValidTask(
        Task memory _task
    ) internal view override returns (bool) {
        uint256 price = _marketIndexPrice(_getMarketId(_task.market));
        if (_task.command == TaskCommand.STOP_ORDER) {
            if (_task.sizeDelta > 0) {
                // Long: increase position size (buy) once *above* trigger price
                // ex: unwind short position once price is above target price (prevent further loss)
                return price >= _task.triggerPrice;
            } else {
                // Short: decrease position size (sell) once *below* trigger price
                // ex: unwind long position once price is below trigger price (prevent further loss)
                return price <= _task.triggerPrice;
            }
        } else if (_task.command == TaskCommand.LIMIT_ORDER) {
            if (_task.sizeDelta > 0) {
                // Long: increase position size (buy) once *below* trigger price
                // ex: open long position once price is below trigger price
                return price <= _task.triggerPrice;
            } else {
                // Short: decrease position size (sell) once *above* trigger price
                // ex: open short position once price is above trigger price
                return price >= _task.triggerPrice;
            }
        }
        return false;
    }

    function _perpExecuteTask(
        uint256 _taskId,
        Task memory _task
    ) internal override {
        uint128 accountId = _allocatedAccount(_task.source, _task.market);

        if (_task.command == TaskCommand.STOP_ORDER) {
            (, , int128 lastSize) = PERPS_MARKET.getOpenPosition(
                accountId,
                uint128(_task.market)
            );
            if (lastSize == 0 || _isSameSign(lastSize, _task.sizeDelta)) {
                EVENTS.emitCancelGelatoTask({
                    taskId: _taskId,
                    gelatoTaskId: _task.gelatoTaskId,
                    reason: "INVALID_SIZE"
                });
                return;
            }
            if (_abs(_task.sizeDelta) > _abs(lastSize)) {
                // bound conditional order size delta to current position size
                _task.sizeDelta = -lastSize;
            }
        }
        // if margin was locked, free it
        if (_task.collateralDelta > 0) {
            lockedFund -= _abs(_task.collateralDelta);
        }
        if (_task.collateralDelta != 0) {
            _modifyCollateral(accountId, _task.collateralDelta);
        }
        _placeOrder({
            _source: _task.source,
            _marketId: uint128(_task.market),
            _accountId: accountId,
            _sizeDelta: int128(_task.sizeDelta),
            _acceptablePrice: _task.acceptablePrice,
            _referrer: _task.referrer
        });
    }

    function _modifyCollateral(uint128 accountId, int256 amount) internal {
        uint256 usdcAmount = _unitToUsd(_abs(amount));
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
            _sizeDelta = lastSize * -1;
        }

        uint256 price = _marketIndexPrice(_marketId);
        bool isIncrease = lastSize == 0 || _isSameSign(lastSize, _sizeDelta);

        // _preOrder({
        //     _accountId: _accountId,
        //     _lastSize: lastSize,
        //     _sizeDelta: _sizeDelta,
        //     _price: price,
        //     _isIncrease: isIncrease
        // });

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
            market: uint256(_marketId),
            sizeDelta: int256(_sizeDelta),
            acceptablePrice: _acceptablePrice,
            commitmentTime: block.timestamp,
            commitmentBlock: block.number,
            fees: fees,
            source: _source
        });

        _postOrder({
            _accountId: _accountId,
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
        override
        returns (uint128 accountId, int256 size, int256 pnl, int256 funding)
    {
        accountId = _accountId;
        (pnl, funding, size) = IPerpsMarket(PERPS_MARKET).getOpenPosition(
            _accountId,
            uint128(_market)
        );
    }

    function _perpAccountIdle(
        uint128 _accountId
    ) internal view override returns (bool) {
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

    function _getMarketId(uint256 _market) internal pure returns (uint128) {
        return uint128(_market);
    }

    function _marketIndexPrice(
        uint128 _marketId
    ) internal view returns (uint256) {
        return IPerpsMarket(PERPS_MARKET).indexPrice(_marketId);
    }

    function _tokenToUsd(
        uint256 _tokenAmount,
        uint128 _marketId
    ) internal view returns (uint256) {
        // ETH: 100
        return
            _unitToUsd(
                (_tokenAmount * _marketIndexPrice(_marketId)) / 10 ** 18
            );
    }
}
