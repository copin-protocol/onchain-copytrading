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
    uint256 internal constant INCREASE_SLIPPAGE = 3;
    uint256 internal constant DECREASE_SLIPPAGE = 10;

    address[] _pendingClosedMarkets;

    constructor(
        ConstructorParams memory _params
    )
        CopyWallet(
            ICopyWallet.CopyWalletConstructorParams({
                factory: _params.factory,
                events: _params.events,
                configs: _params.configs,
                usdAsset: _params.usdAsset
            })
        )
    {
        PERPS_V2_EXCHANGE_RATE = IPerpsV2ExchangeRate(_params.exchangeRate);
        FUTURES_MARKET_MANAGER = IFuturesMarketManager(_params.marketManager);
        SYSTEM_STATUS = ISystemStatus(_params.systemStatus);
    }

    /* ========== VIEWS ========== */

    function ethToUsd(uint256 _fee) public view override returns (uint256) {
        return _tokenToUsd(_fee, _getPerpsV2Market(ETH_MARKET_KEY));
    }

    /* ========== PERPS ========== */

    function copy(address _trader, uint256 _market) external override {
        address market = address(uint160(_market));
        Copytrade memory copytrade = _copytrades[_trader];

        require(copytrade.margin != 0, "CopyWallet: Copytrade is not exist");

        IPerpsV2MarketConsolidated.Position
            memory traderPosition = IPerpsV2MarketConsolidated(market)
                .positions(_trader);

        IPerpsV2MarketConsolidated.Position
            memory position = IPerpsV2MarketConsolidated(market).positions(
                address(this)
            );

        Position memory copyPosition = _positions[_market];

        require(
            position.size == 0 || _trader == copyPosition.trader,
            "CopyWallet: Trader mismatch"
        );

        require(
            _abs(traderPosition.size) != copyPosition.lastTraderSize,
            "CopyWallet: Trader position size has not changed"
        );

        require(
            traderPosition.size * position.size >= 0,
            "CopyWallet: Position side mismatch"
        );

        IPerpsV2MarketConsolidated.DelayedOrder
            memory delayedOrder = IPerpsV2MarketConsolidated(market)
                .delayedOrders(address(this));

        if (
            delayedOrder.sizeDelta != 0 &&
            delayedOrder.intentionTime + 60 < block.timestamp
        ) {
            IPerpsV2MarketConsolidated(market).cancelOffchainDelayedOrder(
                address(this)
            );
        }

        if (traderPosition.size != 0) {
            _placeOrder({
                _trader: _trader,
                _market: market,
                _traderSize: traderPosition.size,
                _size: position.size,
                _copytrade: copytrade,
                _copyPosition: copyPosition
            });
        } else {
            _closeOrder({
                _trader: _trader,
                _market: market,
                _traderSize: traderPosition.size,
                _size: position.size
            });
        }
    }

    function closePosition(uint256 _market) external override onlyOwner {
        address market = address(uint160(_market));
        Position memory copyPosition = _positions[_market];
        IPerpsV2MarketConsolidated.Position
            memory position = IPerpsV2MarketConsolidated(market).positions(
                address(this)
            );
        _closeOrder({
            _trader: copyPosition.trader,
            _market: market,
            _traderSize: position.size > 0
                ? -int256(copyPosition.lastTraderSize)
                : int256(copyPosition.lastTraderSize),
            _size: -position.size
        });
    }

    function _placeOrder(
        address _trader,
        address _market,
        int256 _traderSize,
        int256 _size,
        Copytrade memory _copytrade,
        Position memory _copyPosition
    ) internal {
        if (_pendingClosedMarkets.length > 0) {
            for (uint i = 0; i < _pendingClosedMarkets.length; i++) {
                IPerpsV2MarketConsolidated(_pendingClosedMarkets[i])
                    .withdrawAllMargin();
            }
            delete _pendingClosedMarkets;
        }

        uint256 price = _indexPrice(IPerpsV2MarketConsolidated(_market));

        int256 sizeDelta;

        if (_size == 0) {
            // open
            _sufficientFund(int256(_copytrade.margin), false);
            IPerpsV2MarketConsolidated(_market).transferMargin(
                int256(_copytrade.margin)
            );
            uint256 baseSize = (_copytrade.margin *
                _copytrade.leverage *
                1e18) / price;
            sizeDelta = _traderSize > 0 ? int256(baseSize) : -int256(baseSize);
        } else {
            sizeDelta =
                (int256(_abs(_traderSize)) * _size) /
                int256(_copyPosition.lastTraderSize) -
                _size;
        }

        bool isIncrease = false;
        uint256 acceptablePrice;

        if (
            (_traderSize > 0 && sizeDelta > 0) ||
            (_traderSize < 0 && sizeDelta < 0)
        ) {
            // increase
            isIncrease = true;
            acceptablePrice =
                (price *
                    (
                        _traderSize > 0
                            ? 1000 + INCREASE_SLIPPAGE
                            : 1000 - INCREASE_SLIPPAGE
                    )) /
                1000;

            if (_size != 0) {
                uint256 maxSize = (_copytrade.maxMarginPerOI *
                    _copytrade.leverage *
                    1e18) / price;
                if (_abs(_size + sizeDelta) > maxSize) {
                    if (_traderSize > 0) {
                        sizeDelta = int256(maxSize) - int256(_abs(_size));
                    } else {
                        sizeDelta = int256(_abs(_size)) - int256(maxSize);
                    }
                }
                uint256 requiredMargin = (_abs(_size + sizeDelta) * price) /
                    _copytrade.leverage;
                (uint256 remainingMargin, ) = IPerpsV2MarketConsolidated(
                    _market
                ).remainingMargin(address(this));
                if (requiredMargin > remainingMargin) {
                    _sufficientFund(
                        int256(requiredMargin - remainingMargin),
                        false
                    );
                    IPerpsV2MarketConsolidated(_market).transferMargin(
                        int256(requiredMargin - remainingMargin)
                    );
                }
            }
        } else {
            if (_abs(sizeDelta) >= _abs(_size)) {
                // reduce only
                sizeDelta = -_size;
                _pendingClosedMarkets.push(_market);
            }
            acceptablePrice =
                (price *
                    (
                        _traderSize > 0
                            ? 1000 - DECREASE_SLIPPAGE
                            : 1000 + DECREASE_SLIPPAGE
                    )) /
                1000;
        }

        require(sizeDelta != 0, "CopyWallet: Zero size delta");

        IPerpsV2MarketConsolidated(_market)
            .submitOffchainDelayedOrderWithTracking({
                sizeDelta: sizeDelta,
                desiredFillPrice: acceptablePrice,
                trackingCode: TRACKING_CODE
            });
        _postOrder({
            _id: uint256(uint160(_market)),
            _trader: _trader,
            _lastTraderSize: _abs(_traderSize),
            _lastSize: _abs(_size),
            _sizeDelta: _abs(sizeDelta),
            _price: price,
            _isIncrease: isIncrease
        });
    }

    function _closeOrder(
        address _trader,
        address _market,
        int256 _traderSize,
        int256 _size
    ) internal {
        uint256 price = _indexPrice(IPerpsV2MarketConsolidated(_market));
        uint256 acceptablePrice = (price *
            (
                _traderSize > 0
                    ? 1000 - DECREASE_SLIPPAGE
                    : 1000 + DECREASE_SLIPPAGE
            )) / 1000;

        _pendingClosedMarkets.push(_market);

        IPerpsV2MarketConsolidated(_market)
            .submitCloseOffchainDelayedOrderWithTracking({
                desiredFillPrice: acceptablePrice,
                trackingCode: TRACKING_CODE
            });

        _postOrder({
            _id: uint256(uint160(_market)),
            _trader: _trader,
            _lastTraderSize: _abs(_traderSize),
            _lastSize: _abs(_size),
            _sizeDelta: _abs(_size),
            _price: price,
            _isIncrease: false
        });
    }

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
            require(!invalid, "Invalid price");
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
