// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopyWallet} from "contracts/interfaces/ICopyWallet.sol";
import {IConfigs} from "contracts/interfaces/IConfigs.sol";
import {ICopyWalletSNXv2, IPerpsV2MarketConsolidated} from "contracts/interfaces/ICopyWalletSNXv2.sol";
import {CopyWallet} from "contracts/core/CopyWallet.sol";
import {IFuturesMarketManager} from "contracts/interfaces/SNXv2/IFuturesMarketManager.sol";
import {IPerpsV2ExchangeRate} from "contracts/interfaces/SNXv2/IPerpsV2ExchangeRate.sol";
import {ISystemStatus} from "contracts/interfaces/SNXv2/ISystemStatus.sol";

contract CopyWalletSNXv2 is CopyWallet, ICopyWalletSNXv2 {
    /* ========== IMMUTABLES ========== */
    IPerpsV2ExchangeRate internal immutable PERPS_V2_EXCHANGE_RATE;
    IFuturesMarketManager internal immutable FUTURES_MARKET_MANAGER;
    ISystemStatus internal immutable SYSTEM_STATUS;

    /* ========== CONSTANTS ========== */
    uint256 internal constant MAX_PRICE_LATENCY = 120;
    bytes32 internal constant ETH_MARKET_KEY = "sETHPERP";

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
        PERPS_V2_EXCHANGE_RATE = IPerpsV2ExchangeRate(_params.exchangeRate);
        FUTURES_MARKET_MANAGER = IFuturesMarketManager(_params.marketManager);
        SYSTEM_STATUS = ISystemStatus(_params.systemStatus);
    }

    /* ========== VIEWS ========== */

    function executorUsdFee(
        uint256 _fee
    ) public view override returns (uint256) {
        return _tokenToUsd(_fee, _getPerpsV2Market(ETH_MARKET_KEY));
    }

    /* ========== PERPS ========== */

    function _placeOrder(
        address _source,
        address _market,
        int256 _sizeDelta,
        uint256 _acceptablePrice
    ) internal {
        IPerpsV2MarketConsolidated.Position
            memory position = IPerpsV2MarketConsolidated(_market).positions(
                address(this)
            );

        if (
            position.size != 0 &&
            _source != _positions[uint256(uint160(_market))].source
        ) {
            revert SourceMismatch();
        }

        if (
            position.size != 0 &&
            !_isSameSign(_sizeDelta, position.size) &&
            _abs(_sizeDelta) > _abs(position.size)
        ) {
            // reduce only
            _sizeDelta = -position.size;
        }
        bool isIncrease = position.size == 0 ||
            _isSameSign(position.size, _sizeDelta);
        uint256 price = _indexPrice(IPerpsV2MarketConsolidated(_market));

        IPerpsV2MarketConsolidated(_market)
            .submitOffchainDelayedOrderWithTracking({
                sizeDelta: _sizeDelta,
                desiredFillPrice: _acceptablePrice,
                trackingCode: TRACKING_CODE
            });
        _postOrder({
            _id: uint256(uint160(_market)),
            _source: _source,
            _lastSize: _abs(position.size),
            _sizeDelta: _abs(_sizeDelta),
            _price: price,
            _isIncrease: isIncrease
        });
    }

    function _perpCancelOrder(bytes calldata _inputs) internal override {
        address market;
        assembly {
            market := calldataload(_inputs.offset)
        }
        IPerpsV2MarketConsolidated(market).cancelOffchainDelayedOrder(
            address(this)
        );
    }

    function _perpWithdrawAllMargin(bytes calldata _inputs) internal override {
        require(_inputs.length % 0x20 == 0, "Invalid input length");
        uint256 length = _inputs.length / 0x20;

        for (uint256 i = 0; i < length; i++) {
            address market;
            assembly {
                market := calldataload(add(_inputs.offset, mul(i, 0x20)))
            }
            IPerpsV2MarketConsolidated(market).withdrawAllMargin();
        }
    }

    function _perpModifyCollateral(bytes calldata _inputs) internal override {
        address market;
        int256 amount;
        assembly {
            market := calldataload(_inputs.offset)
            amount := calldataload(add(_inputs.offset, 0x20))
        }
        if (amount > 0) {
            _sufficientFund(amount, true);
        }
        IPerpsV2MarketConsolidated(market).transferMargin(amount);
    }

    function _perpPlaceOrder(bytes calldata _inputs) internal override {
        address source;
        address market;
        int256 sizeDelta;
        uint256 acceptablePrice;
        assembly {
            source := calldataload(_inputs.offset)
            market := calldataload(add(_inputs.offset, 0x20))
            sizeDelta := calldataload(add(_inputs.offset, 0x40))
            acceptablePrice := calldataload(add(_inputs.offset, 0x60))
        }
        _placeOrder({
            _source: source,
            _market: market,
            _sizeDelta: sizeDelta,
            _acceptablePrice: acceptablePrice
        });
    }

    function _perpCloseOrder(bytes calldata _inputs) internal override {
        address source;
        address market;
        uint256 acceptablePrice;
        assembly {
            source := calldataload(_inputs.offset)
            market := calldataload(add(_inputs.offset, 0x20))
            acceptablePrice := calldataload(add(_inputs.offset, 0x40))
        }

        if (source != _positions[uint256(uint160(market))].source) {
            revert SourceMismatch();
        }

        IPerpsV2MarketConsolidated.Position
            memory position = IPerpsV2MarketConsolidated(market).positions(
                address(this)
            );
        uint256 price = _indexPrice(IPerpsV2MarketConsolidated(market));
        IPerpsV2MarketConsolidated(market)
            .submitCloseOffchainDelayedOrderWithTracking({
                desiredFillPrice: acceptablePrice,
                trackingCode: TRACKING_CODE
            });
        _postOrder({
            _id: uint256(uint160(market)),
            _source: source,
            _lastSize: _abs(position.size),
            _sizeDelta: _abs(position.size),
            _price: price,
            _isIncrease: false
        });
    }

    /* ========== TASKS ========== */

    // TODO task
    // function _perpValidTask(
    //     Task memory _task
    // ) internal view override returns (bool) {
    //     IPerpsV2MarketConsolidated market = IPerpsV2MarketConsolidated(
    //         address(uint160(_task.market))
    //     );
    //     try
    //         SYSTEM_STATUS.requireFuturesMarketActive(market.marketKey())
    //     {} catch {
    //         return false;
    //     }
    //     uint256 price = _indexPrice(market);
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
    //     IPerpsV2MarketConsolidated market = IPerpsV2MarketConsolidated(
    //         address(uint160(_task.market))
    //     );
    //     if (_task.command == TaskCommand.STOP_ORDER) {
    //         IPerpsV2MarketConsolidated.Position memory position = market
    //             .positions(address(this));
    //         if (
    //             position.size == 0 ||
    //             _isSameSign(position.size, _task.sizeDelta)
    //         ) {
    //             EVENTS.emitCancelGelatoTask({
    //                 taskId: _taskId,
    //                 gelatoTaskId: _task.gelatoTaskId,
    //                 reason: "INVALID_SIZE"
    //             });
    //             return;
    //         }
    //         if (_abs(_task.sizeDelta) > _abs(position.size)) {
    //             // bound conditional order size delta to current position size
    //             _task.sizeDelta = -position.size;
    //         }
    //     }
    //     // if margin was locked, free it
    //     if (_task.collateralDelta > 0) {
    //         lockedFund -= _abs(_task.collateralDelta);
    //     }
    //     if (_task.collateralDelta != 0) {
    //         if (_task.collateralDelta > 0) {
    //             _sufficientFund(_task.collateralDelta, true);
    //         }
    //         market.transferMargin(_task.collateralDelta);
    //     }
    //     _placeOrder({
    //         _source: _task.source,
    //         _market: address(uint160(_task.market)),
    //         _sizeDelta: _task.sizeDelta,
    //         _acceptablePrice: _task.acceptablePrice
    //     });
    // }

    /* ========== UTILITIES ========== */

    function _getPerpsV2Market(
        bytes32 _marketKey
    ) internal view returns (IPerpsV2MarketConsolidated market) {
        market = IPerpsV2MarketConsolidated(
            FUTURES_MARKET_MANAGER.marketForKey(_marketKey)
        );
        assert(address(market) != address(0));
    }

    function _indexPrice(
        IPerpsV2MarketConsolidated _market
    ) internal view returns (uint256) {
        bytes32 assetId = _market.baseAsset();

        (uint256 price, uint256 publishTime) = PERPS_V2_EXCHANGE_RATE
            .resolveAndGetLatestPrice(assetId);

        // if the price is stale, get the latest price from the market
        if (publishTime < block.timestamp - MAX_PRICE_LATENCY) {
            // fetch asset price and ensure it is valid
            bool invalid;
            (price, invalid) = _market.assetPrice();
            if (invalid) revert InvalidPrice();
        }
        return price;
    }

    function _tokenToUsd(
        uint256 _tokenAmount,
        IPerpsV2MarketConsolidated _market
    ) internal view returns (uint256) {
        return _d18ToUsd((_tokenAmount * _indexPrice(_market)) / 10 ** 18);
    }
}
