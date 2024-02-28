// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICopyWallet} from "contracts/interfaces/ICopyWallet.sol";
import {IConfigs} from "contracts/interfaces/IConfigs.sol";
import {ICopyWalletGMXv1} from "contracts/interfaces/ICopyWalletGMXv1.sol";
import {CopyWallet} from "contracts/core/CopyWallet.sol";
import {IRouter} from "contracts/interfaces/GMXv1/IRouter.sol";
import {IPositionRouter} from "contracts/interfaces/GMXv1/IPositionRouter.sol";
import {IVault} from "contracts/interfaces/GMXv1/IVault.sol";

contract CopyWalletGMXv1 is CopyWallet, ICopyWalletGMXv1 {
    IRouter internal immutable ROUTER;
    IPositionRouter internal immutable POSITION_ROUTER;
    IVault internal immutable VAULT;
    address internal immutable weth;

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
        ROUTER = IRouter(_params.router);
        POSITION_ROUTER = IPositionRouter(_params.positionRouter);
        VAULT = IVault(_params.vault);
        weth = _params.weth;
    }

    function executorUsdFee(
        uint256 _fee
    ) public view override returns (uint256) {
        return _tokenToUsd(_fee, weth);
    }

    function _perpInit() internal override {
        ROUTER.approvePlugin(address(POSITION_ROUTER));
    }

    function _placeOrder(
        address _source,
        address _market,
        bool _isLong,
        bool _isIncrease,
        uint256 _collateralDelta,
        uint256 _sizeUsdDelta,
        uint256 _acceptablePrice
    ) internal {
        (uint256 sizeUsdD30,,uint256 averagePriceD30,,,,,) = VAULT.getPosition(address(this), _isLong ? _market : address(USD_ASSET), _market, _isLong);

        uint256 executionFee = POSITION_ROUTER.minExecutionFee() * 120 / 100;
        if (executionFee > msg.value) revert ExecutionFeeNotEnough();
        uint256 executionFeeUsd = _tokenToUsd(executionFee, weth);
        
        if (_isIncrease) {
            address[] memory path;
            if (_isLong) {
                path = new address[](2);
                path[0] = address(USD_ASSET);
                path[1] = _market;
            } else {
                path = new address[](1);    
                path[0] = address(USD_ASSET);
            }

            if (_collateralDelta > 0) USD_ASSET.approve(address(ROUTER), _collateralDelta);

            POSITION_ROUTER.createIncreasePosition{value: executionFee}({
                _path: path,
                _indexToken: _market,
                _amountIn: _collateralDelta,
                _minOut: 0,
                _sizeDelta: _sizeUsdDelta * 10 ** 12,
                _isLong: _isLong,
                _acceptablePrice: _acceptablePrice * 10 ** 12,
                _executionFee: executionFee,
                _referralCode: TRACKING_CODE,
                _callbackTarget: address(0)
            });
        } else {
            address[] memory path;
            if (_isLong) {
                path = new address[](2);
                path[0] = _market;
                path[1] = address(USD_ASSET);
            } else {
                path = new address[](1);
                path[0] = address(USD_ASSET);
            }

            POSITION_ROUTER.createDecreasePosition{value: executionFee}({
                _path: path,
                _indexToken: _market,
                _collateralDelta: _usdToD18(_collateralDelta) * 10 ** 12,
                _sizeDelta: _sizeUsdDelta * 10 ** 12,
                _isLong: _isLong,
                _receiver: address(this),
                _acceptablePrice: _acceptablePrice * 10 ** 12,
                _minOut: 0,
                _executionFee: executionFee,
                _withdrawETH: false,
                _callbackTarget: address(0)
            });
        }
        address feeReceiver = CONFIGS.feeReceiver();
        USD_ASSET.transfer(feeReceiver, executionFeeUsd);
        EVENTS.emitChargeExecutorFee({
            executor: address(POSITION_ROUTER),
            receiver: feeReceiver,
            fee: executionFee,
            feeUsd: executionFeeUsd
        });
        _postOrder({
            _id: uint256(uint160(_market)),
            _source: _source,
            _lastSize: sizeUsdD30 > 0 && averagePriceD30 > 0 ? sizeUsdD30 * 1e18 / averagePriceD30 : 0,
            _sizeDelta: _sizeUsdDelta * 10 ** 30 / _indexPriceD30(_market),
            _price: _indexPrice(_market),
            _isIncrease: _isIncrease
        });
    }

    function _perpCancelOrder(bytes calldata _inputs) internal override {}

    function _perpWithdrawAllMargin(bytes calldata _inputs) internal override {}

    function _perpModifyCollateral(bytes calldata _inputs) internal override {}

    function _perpPlaceOrder(bytes calldata _inputs) internal override {
        address source;
        address market;
        bool isLong;
        bool isIncrease;
        uint256 collateralDelta;
        uint256 sizeUsdDelta;
        uint256 acceptablePrice;
        assembly {
            source := calldataload(_inputs.offset)
            market := calldataload(add(_inputs.offset, 0x20))
            isLong := calldataload(add(_inputs.offset, 0x40))
            isIncrease := calldataload(add(_inputs.offset, 0x60))
            collateralDelta := calldataload(add(_inputs.offset, 0x80))
            sizeUsdDelta := calldataload(add(_inputs.offset, 0xa0))
            acceptablePrice := calldataload(add(_inputs.offset, 0xc0))
        }
        _placeOrder({
            _source: source,
            _market: market,
            _isLong: isLong,
            _isIncrease: isIncrease,
            _collateralDelta: collateralDelta,
            _sizeUsdDelta: sizeUsdDelta,
            _acceptablePrice: acceptablePrice
        });
    }

    function _perpCloseOrder(bytes calldata _inputs) internal override {
        address source;
        address market;
        bool isLong;
        uint256 acceptablePrice;
        assembly {
            source := calldataload(_inputs.offset)
            market := calldataload(add(_inputs.offset, 0x20))
            isLong := calldataload(add(_inputs.offset, 0x40))
            acceptablePrice := calldataload(add(_inputs.offset, 0x60))
        }

        if (source != _positions[uint256(uint160(market))].source) {
            revert SourceMismatch();
        }

        (uint256 sizeUsdD30,,uint256 averagePriceD30,,,,,) = VAULT.getPosition(address(this), isLong ? market : address(USD_ASSET), market, isLong);

        if (sizeUsdD30 == 0 || averagePriceD30 == 0) revert NoOpenPosition();

        uint256 executionFee = POSITION_ROUTER.minExecutionFee() * 120 / 100;
        if (executionFee > msg.value) revert ExecutionFeeNotEnough();
        uint256 executionFeeUsd = _tokenToUsd(executionFee, weth);

        address[] memory path;
        if (isLong) {
            path = new address[](2);
            path[0] = market;
            path[1] = address(USD_ASSET);
        } else {
            path = new address[](1);
            path[0] = address(USD_ASSET);
        }

        POSITION_ROUTER.createDecreasePosition{value: executionFee}({
            _path: path,
            _indexToken: market,
            _collateralDelta: 0,
            _sizeDelta: sizeUsdD30,
            _isLong: isLong,
            _receiver: address(this),
            _acceptablePrice: acceptablePrice * 10 ** 12,
            _minOut: 0,
            _executionFee: executionFee,
            _withdrawETH: false,
            _callbackTarget: address(0)
        });

        address feeReceiver = CONFIGS.feeReceiver();
        USD_ASSET.transfer(feeReceiver, executionFeeUsd);
        EVENTS.emitChargeExecutorFee({
            executor: address(ROUTER),
            receiver: feeReceiver,
            fee: executionFee,
            feeUsd: executionFeeUsd
        });

        _postOrder({
            _id: uint256(uint160(market)),
            _source: source,
            _lastSize: sizeUsdD30 * 1e18 / averagePriceD30,
            _sizeDelta: sizeUsdD30 * 1e18 / averagePriceD30,
            _price: _indexPrice(market),
            _isIncrease: false
        });
    }

    // TODO enable again
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

    function _indexPrice(
        address _token
    ) internal view returns (uint256) {
        return VAULT.getMaxPrice(_token) / 10 ** 12;
    }

    function _indexPriceD30(
        address _token
    ) internal view returns (uint256) {
        return VAULT.getMaxPrice(_token);
    }

    function _tokenToUsd(
        uint256 _tokenAmount,
        address _token
    ) internal view returns (uint256) {
        return _d18ToUsd((_tokenAmount * _indexPrice(_token)) / 10 ** 18);
    }
}
