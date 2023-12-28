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
                trustedForwarder: _params.trustedForwarder,
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
        uint128 accountId;
        int256 amount;
        assembly {
            accountId := calldataload(_inputs.offset)
            amount := calldataload(add(_inputs.offset, 0x20))
        }
        uint256 usdcAmount = _toUsdAsset(_abs(amount));
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

    function _perpPlaceOrder(bytes calldata _inputs) internal override {
        address source;
        uint128 marketId;
        uint128 accountId;
        int128 sizeDelta;
        uint256 acceptablePrice;
        address referrer;
        assembly {
            source := calldataload(_inputs.offset)
            marketId := calldataload(add(_inputs.offset, 0x20))
            accountId := calldataload(add(_inputs.offset, 0x40))
            sizeDelta := calldataload(add(_inputs.offset, 0x60))
            acceptablePrice := calldataload(add(_inputs.offset, 0x80))
            referrer := calldataload(add(_inputs.offset, 0xa0))
        }
        if (accountId == 0)
            accountId = allocatedAccount(source, uint256(marketId), true);
        (, , int128 lastSize) = PERPS_MARKET.getOpenPosition(
            accountId,
            marketId
        );
        _placeOrder({
            _source: source,
            _marketId: marketId,
            _accountId: accountId,
            _sizeDelta: sizeDelta,
            _lastSize: lastSize,
            _acceptablePrice: acceptablePrice,
            _trackingCode: TRACKING_CODE,
            _referrer: referrer
        });
    }

    function _perpCloseOrder(bytes calldata _inputs) internal override {
        address source;
        uint128 marketId;
        uint128 accountId;
        address referrer;
        assembly {
            source := calldataload(_inputs.offset)
            marketId := calldataload(add(_inputs.offset, 0x20))
            accountId := calldataload(add(_inputs.offset, 0x40))
            referrer := calldataload(add(_inputs.offset, 0x60))
        }
        if (accountId == 0)
            accountId = allocatedAccount(source, uint256(marketId), true);
        (, , int128 lastSize) = PERPS_MARKET.getOpenPosition(
            accountId,
            marketId
        );
        _placeOrder({
            _source: source,
            _marketId: marketId,
            _accountId: accountId,
            _sizeDelta: lastSize * -1,
            _lastSize: lastSize,
            _acceptablePrice: lastSize > 0 ? 1 : type(uint256).max,
            _trackingCode: TRACKING_CODE,
            _referrer: referrer
        });
    }

    function _perpValidTask(
        Task memory _task
    ) internal view override returns (bool) {
        uint256 price = _marketIndexPrice(_getMarketId(_task.market));
        if (_task.command == TaskCommand.STOP_ORDER) {
            if (_task.sizeDelta > 0) {
                // Long: increase position size (buy) once *above* target price
                // ex: unwind short position once price is above target (prevent further loss)
                return price >= _task.triggerPrice;
            } else {
                // Short: decrease position size (sell) once *below* target price
                // ex: unwind long position once price is below target (prevent further loss)
                return price <= _task.triggerPrice;
            }
        }
        return false;
    }

    function _perpExecuteTask(Task memory _task) internal override {
        // // define Synthetix PerpsV2 market
        // IPerpsV2MarketConsolidated market = _getPerpsV2Market(_task.marketKey);
        // /// @dev conditional order is valid given checker() returns true; define fill price
        // (uint256 fillPrice, PriceOracleUsed priceOracle) = _sUSDRate(market);
        // // if conditional order is reduce only, ensure position size is only reduced
        // if (conditionalOrder.reduceOnly) {
        //     int256 currentSize = market
        //         .positions({account: address(this)})
        //         .size;
        //     // ensure position exists and incoming size delta is NOT the same sign
        //     /// @dev if incoming size delta is the same sign, then the conditional order is not reduce only
        //     if (
        //         currentSize == 0 ||
        //         _isSameSign(currentSize, conditionalOrder.sizeDelta)
        //     ) {
        //         EVENTS.emitConditionalOrderCancelled({
        //             conditionalOrderId: _conditionalOrderId,
        //             gelatoTaskId: conditionalOrder.gelatoTaskId,
        //             reason: ConditionalOrderCancelledReason
        //                 .CONDITIONAL_ORDER_CANCELLED_NOT_REDUCE_ONLY
        //         });
        //         return;
        //     }
        //     // ensure incoming size delta is not larger than current position size
        //     /// @dev reduce only conditional orders can only reduce position size (i.e. approach size of zero) and
        //     /// cannot cross that boundary (i.e. short -> long or long -> short)
        //     if (_abs(conditionalOrder.sizeDelta) > _abs(currentSize)) {
        //         // bound conditional order size delta to current position size
        //         conditionalOrder.sizeDelta = -currentSize;
        //     }
        // }
        // // if margin was committed, free it
        // if (conditionalOrder.collateralDelta > 0) {
        //     committedMargin -= _abs(conditionalOrder.collateralDelta);
        // }
        // // execute trade
        // _perpsV2ModifyMargin({
        //     _market: address(market),
        //     _amount: conditionalOrder.collateralDelta
        // });
        // _perpsV2SubmitOffchainDelayedOrder({
        //     _market: address(market),
        //     _sizeDelta: conditionalOrder.sizeDelta,
        //     _acceptablePrice: conditionalOrder.acceptablePrice
        // });
    }

    function _placeOrder(
        address _source,
        uint128 _marketId,
        uint128 _accountId,
        int128 _sizeDelta,
        int128 _lastSize,
        uint256 _acceptablePrice,
        bytes32 _trackingCode,
        address _referrer
    ) internal returns (IPerpsMarket.Data memory retOrder, uint256 fees) {
        bytes32 key = keccak256(abi.encodePacked(_source, uint256(_marketId)));
        uint256 keyAccountId = _keyAccounts[key];
        if (keyAccountId != 0 && keyAccountId != _accountId)
            revert AccountMismatch();

        uint256 sizeDeltaUsd = _tokenToUsd(_abs(_sizeDelta), _marketId);
        _preOrder(uint256(_marketId), sizeDeltaUsd);

        // close
        if (_lastSize + _sizeDelta == 0) {
            // release account
            _accountTradings[_accountId] = false;
            _keyAccounts[key] = 0;
        } else {
            _accountTradings[_accountId] = true;
            if (keyAccountId == 0) _keyAccounts[key] = _accountId;
        }

        (retOrder, fees) = PERPS_MARKET.commitOrder(
            IPerpsMarket.OrderCommitmentRequest({
                marketId: _marketId,
                accountId: _accountId,
                sizeDelta: _sizeDelta,
                settlementStrategyId: 0,
                acceptablePrice: _acceptablePrice,
                trackingCode: _trackingCode,
                referrer: _referrer
            })
        );

        _postOrder(uint256(_marketId), sizeDeltaUsd);
    }

    function _perpGetOpenPosition(
        uint128 _accountId,
        uint256 _market
    ) internal view override returns (int256 size, int256 pnl, int256 funding) {
        (pnl, funding, size) = IPerpsMarket(PERPS_MARKET).getOpenPosition(
            _accountId,
            uint128(_market)
        );
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
            _toUsdAsset(
                (_tokenAmount * _marketIndexPrice(_marketId)) / 10 ** 18
            );
    }
}
