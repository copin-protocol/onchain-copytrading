// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopyWallet} from "contracts/interfaces/ICopyWallet.sol";
import {IConfigs} from "contracts/interfaces/IConfigs.sol";
import {ICopyWalletGNSv8} from "contracts/interfaces/ICopyWalletGNSv8.sol";
import {CopyWallet} from "contracts/core/CopyWallet.sol";
import {IRouter} from "contracts/interfaces/GMXv1/IRouter.sol";
import {IPositionRouter} from "contracts/interfaces/GMXv1/IPositionRouter.sol";
import {IVault} from "contracts/interfaces/GMXv1/IVault.sol";
import {IPyth} from "contracts/interfaces/pyth/IPyth.sol";
import {PythStructs} from "contracts/interfaces/pyth/PythStructs.sol";
import {IGainsTrading} from "contracts/interfaces/GNSv8/IGainsTrading.sol";

contract CopyWalletGNSv8 is CopyWallet, ICopyWalletGNSv8 {
    /* ========== CONSTANTS ========== */
    bytes32 internal constant ETH_PRICE_FEED =
        0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    /* ========== IMMUTABLES ========== */
    IGainsTrading internal immutable GAINS_TRADING;
    IPyth internal immutable PYTH;

    mapping(bytes32 => uint32) _keyIndexes;
    mapping(uint32 => TraderPosition) _traderPositions;

    /* ========== CONSTRUCTOR ========== */

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
        GAINS_TRADING = IGainsTrading(_params.gainsTrading);
        PYTH = IPyth(_params.pyth);
    }

    /* ========== VIEWS ========== */

    function ethToUsd(uint256 _amount) public view override returns (uint256) {
        PythStructs.Price memory price = PYTH.getPriceUnsafe(ETH_PRICE_FEED);
        return (_convertToUint(price, 6) * _amount) / 10 ** 18;
    }

    function getTraderPosition(
        uint32 _index
    ) external view returns (TraderPosition memory traderPosition) {
        traderPosition = _traderPositions[_index];
    }

    function getKeyIndex(
        address _source,
        uint256 _sourceIndex
    ) external view returns (uint32 index) {
        bytes32 key = keccak256(abi.encodePacked(_source, _sourceIndex));
        index = _keyIndexes[key];
    }

    /* ========== PERPS ========== */

    function closePosition(uint32 _index) external nonReentrant {
        if (!isOwner(msg.sender)) revert Unauthorized();
        TraderPosition memory traderPosition = _traderPositions[_index];
        bytes32 key = keccak256(
            abi.encodePacked(
                traderPosition.trader,
                uint256(traderPosition.index)
            )
        );
        _closeOrder(traderPosition.trader, key, _index);
    }

    function _perpInit() internal override {}

    function _perpWithdrawAllMargin(bytes calldata _inputs) internal override {}

    function _perpModifyCollateral(bytes calldata _inputs) internal override {}

    function _perpCancelOrder(bytes calldata _inputs) internal override {
        uint256 index;
        assembly {
            index := calldataload(_inputs.offset)
        }
        GAINS_TRADING.cancelOpenOrder(uint32(index));
    }

    function _perpPlaceOrder(bytes calldata _inputs) internal override {
        address source;
        uint256 sourceIndex;
        uint256 pairIndex;
        bool isLong;
        uint256 collateral;
        uint256 leverage;
        uint256 price;
        uint256 tp;
        uint256 sl;
        assembly {
            source := calldataload(_inputs.offset)
            sourceIndex := calldataload(add(_inputs.offset, 0x20))
            pairIndex := calldataload(add(_inputs.offset, 0x40))
            isLong := calldataload(add(_inputs.offset, 0x60))
            collateral := calldataload(add(_inputs.offset, 0x80))
            leverage := calldataload(add(_inputs.offset, 0xa0))
            price := calldataload(add(_inputs.offset, 0xc0))
            tp := calldataload(add(_inputs.offset, 0xe0))
            sl := calldataload(add(_inputs.offset, 0x100))
        }
        _placeOrder({
            _source: source,
            _sourceIndex: sourceIndex,
            _pairIndex: pairIndex,
            _isLong: isLong,
            _collateral: collateral,
            _leverage: leverage,
            _price: price,
            _tp: tp,
            _sl: sl
        });
    }

    function _perpCloseOrder(bytes calldata _inputs) internal override {
        address source;
        uint256 sourceIndex;
        assembly {
            source := calldataload(_inputs.offset)
            sourceIndex := calldataload(add(_inputs.offset, 0x20))
        }

        bytes32 key = keccak256(abi.encodePacked(source, sourceIndex));
        uint32 index = _keyIndexes[key];
        TraderPosition memory traderPosition = _traderPositions[index];

        if (
            traderPosition.trader != source ||
            traderPosition.index != sourceIndex
        ) {
            revert SourceMismatch();
        }

        _closeOrder(source, key, index);
    }

    function _placeOrder(
        address _source,
        uint256 _sourceIndex,
        uint256 _pairIndex,
        bool _isLong,
        uint256 _collateral,
        uint256 _leverage,
        uint256 _price,
        uint256 _tp,
        uint256 _sl
    ) internal {
        bytes32 key = keccak256(abi.encodePacked(_source, _sourceIndex));
        if (_keyIndexes[key] > 0) {
            revert PositionExist();
        }
        IGainsTrading.Counter memory counter = GAINS_TRADING.getCounters(
            address(this),
            IGainsTrading.CounterType.TRADE
        );
        IGainsTrading.Trade memory trade;
        trade.user = address(this);
        trade.isOpen = true;
        trade.long = _isLong;
        trade.collateralIndex = 3;
        trade.pairIndex = uint16(_pairIndex);
        trade.collateralAmount = uint120(_collateral);
        trade.leverage = uint24(_leverage);
        trade.openPrice = uint64(_price / 10 ** 8);
        trade.tp = uint64(_tp / 10 ** 8);
        trade.sl = uint64(_sl / 10 ** 8);
        trade.index = counter.currentIndex;

        TraderPosition memory traderPosition = TraderPosition({
            trader: _source,
            index: uint32(_sourceIndex),
            __placeholder: 0
        });

        _keyIndexes[key] = trade.index;
        _traderPositions[trade.index] = traderPosition;

        USD_ASSET.approve(address(GAINS_TRADING), _collateral);

        GAINS_TRADING.openTrade(trade, 300, CONFIGS.feeReceiver());

        _postOrder({
            _id: uint256(key),
            _source: _source,
            _lastSizeUsd: 0,
            _sizeDeltaUsd: (_collateral * _leverage) / 1000,
            _isIncrease: true
        });
    }

    function _closeOrder(
        address _source,
        bytes32 _key,
        uint32 _index
    ) internal {
        IGainsTrading.Trade memory trade = GAINS_TRADING.getTrade(
            address(this),
            _index
        );

        GAINS_TRADING.closeTradeMarket(_index);

        uint256 size = (trade.collateralAmount * trade.leverage) / 1000;

        _postOrder({
            _id: uint256(_key),
            _source: _source,
            _lastSizeUsd: size,
            _sizeDeltaUsd: size,
            _isIncrease: false
        });
    }

    /* ========== TASKS ========== */

    // TODO task
    // function _perpValidTask(
    //     Task memory _task
    // ) internal view override returns (bool) {
    //     uint256 price = _indexPrice(address(uint160(_task.market)));
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
    //     bool isLong = _task.command == TaskCommand.LIMIT_ORDER && _task.sizeDelta > 0 || task.command == TaskCommand.STOP_ORDER && _task.sizeDelta < 0;
    //     // if margin was locked, free it
    //     if (_task.collateralDelta > 0) {
    //         lockedFund -= _abs(_task.collateralDelta);
    //     }
    //     if (_task.command == TaskCommand.STOP_ORDER) {
    //         (uint256 sizeUsdD30,,uint256 averagePriceD30) = getPosition(address(this), address(USD_ASSET), market, isLong);
    //         if (
    //             sizeUsdD30 == 0 ||
    //             _isSameSign(sizeUsdD30 * isLong ? 1 : -1 , _task.sizeDelta)
    //         ) {
    //             EVENTS.emitCancelGelatoTask({
    //                 taskId: _taskId,
    //                 gelatoTaskId: _task.gelatoTaskId,
    //                 reason: "INVALID_SIZE"
    //             });
    //             return;
    //         }
    //         if (_abs(_task.sizeDelta) > sizeUsdD30 / 10 ** 12) {
    //             // bound conditional order size delta to current position size
    //             _task.sizeDelta = -int256(sizeUsdD30 / 10 ** 12);
    //         }
    //     }

    //     if (_task.collateralDelta != 0) {
    //         if (_task.collateralDelta > 0) {
    //             _sufficientFund(_task.collateralDelta, true);
    //         }
    //     }
    //     _placeOrder({
    //         _source: _task.source,
    //         _market: address(uint160(_task.market)),
    //         _isLong: isLong,
    //         _isIncrease: _task.command == TaskCommand.LIMIT_ORDER,
    //         _collateralDelta: _task.collateralDelta > 0 ? _abs(_task.collateralDelta) : 0,
    //         _sizeUsdDelta: _abs(_task.sizeDelta),
    //         _acceptablePrice: _task.acceptablePrice
    //     });
    // }

    /* ========== UTILITIES ========== */

    function _convertToUint(
        PythStructs.Price memory price,
        uint8 targetDecimals
    ) private pure returns (uint256) {
        if (price.price < 0 || price.expo > 0 || price.expo < -255) {
            revert();
        }

        uint8 priceDecimals = uint8(uint32(-1 * price.expo));

        if (targetDecimals >= priceDecimals) {
            return
                uint(uint64(price.price)) *
                10 ** uint32(targetDecimals - priceDecimals);
        } else {
            return
                uint(uint64(price.price)) /
                10 ** uint32(priceDecimals - targetDecimals);
        }
    }
}
