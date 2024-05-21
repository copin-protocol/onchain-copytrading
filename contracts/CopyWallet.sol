// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IGainsTrading} from "./interfaces/IGainsTrading.sol";
import {ICopyWallet} from "./interfaces/ICopyWallet.sol";
import {IFactory} from "./interfaces/IFactory.sol";
import {IConfigs} from "./interfaces/IConfigs.sol";
import {IEvents} from "./interfaces/IEvents.sol";
import {IERC20} from "./interfaces/token/IERC20.sol";
import {Owned} from "./utils/Owned.sol";

contract CopyWallet is Owned, ReentrancyGuard, ICopyWallet {
    /* ========== CONSTANTS ========== */

    bytes32 public constant VERSION = "0.1.0";

    /* ========== IMMUTABLES ========== */

    IFactory internal immutable FACTORY;
    IEvents internal immutable EVENTS;
    IConfigs internal immutable CONFIGS;
    IERC20 internal immutable USD_ASSET; // USD token
    IGainsTrading internal immutable GAINS_TRADING;

    /* ========== STATES ========== */

    uint256 public lockedFund;

    mapping(address => CopyTrade) _copyTrades;
    mapping(bytes32 => uint32) _keyIndexes;
    mapping(uint32 => TraderPosition) _traderPositions;

    /* ========== CONSTRUCTOR ========== */

    constructor(CopyWalletConstructorParams memory _params) Owned(address(0)) {
        FACTORY = IFactory(_params.factory);
        EVENTS = IEvents(_params.events);
        CONFIGS = IConfigs(_params.configs);
        USD_ASSET = IERC20(_params.usdAsset);
        GAINS_TRADING = IGainsTrading(_params.gainsTrading);
    }

    /* ========== VIEWS ========== */

    function availableFund() public view override returns (uint256) {
        return USD_ASSET.balanceOf(address(this)) - lockedFund;
    }

    function availableFundD18() public view override returns (uint256) {
        return _usdToD18(availableFund());
    }

    function lockedFundD18() public view override returns (uint256) {
        return _usdToD18(lockedFund);
    }

    /* ========== INIT & OWNERSHIP ========== */

    function init(address _owner) external {
        require(msg.sender == address(FACTORY), "Unauthorized");
        _setInitialOwnership(_owner);
        USD_ASSET.approve(address(GAINS_TRADING), 2 ** 256 - 1);
    }

    function _setInitialOwnership(address _owner) private {
        owner = _owner;
        emit OwnershipTransferred(address(0), _owner);
    }

    function transferOwnership(address _newOwner) public override {
        super.transferOwnership(_newOwner);
        FACTORY.updateCopyWalletOwnership({
            _newOwner: _newOwner,
            _oldOwner: msg.sender
        });
    }

    /* ========== FUNDS ========== */

    receive() external payable {}

    function withdrawEth(uint256 _amount) external onlyOwner {
        _withdrawEth(_amount);
    }

    function modifyFund(int256 _amount) external onlyOwner {
        _modifyFund(_amount);
    }

    function _withdrawEth(uint256 _amount) internal {
        if (_amount > 0) {
            (bool success, ) = payable(msg.sender).call{value: _amount}("");
            require(success, "Eth withdrawal failed");
            EVENTS.emitEthWithdraw({user: msg.sender, amount: _amount});
        }
    }

    function _modifyFund(int256 _amount) internal {
        /// @dev if amount is positive, deposit
        if (_amount > 0) {
            /// @dev failed Synthetix asset transfer will revert and not return false if unsuccessful
            USD_ASSET.transferFrom(msg.sender, address(this), _abs(_amount));
            EVENTS.emitDeposit({user: msg.sender, amount: _abs(_amount)});
        } else if (_amount < 0) {
            /// @dev if amount is negative, withdraw
            _sufficientFund(_amount, true);
            /// @dev failed Synthetix asset transfer will revert and not return false if unsuccessful
            USD_ASSET.transfer(msg.sender, _abs(_amount));
            EVENTS.emitWithdraw({user: msg.sender, amount: _abs(_amount)});
        }
    }

    function _lockFund(int256 _amount, bool origin) internal {
        _sufficientFund(_amount, origin);
        lockedFund += origin ? _abs(_amount) : _d18ToUsd(_abs(_amount));
    }

    /* ========== FEES ========== */

    function _chargeProtocolFee(uint256 _feeUsd) internal {
        address feeReceiver = CONFIGS.feeReceiver();
        USD_ASSET.transfer(feeReceiver, _feeUsd);
        EVENTS.emitChargeProtocolFee({receiver: feeReceiver, feeUsd: _feeUsd});
    }

    /* ========== COPY TRADES ========== */

    function setCopyTrade(
        address _trader,
        CopyTrade memory copyTrade
    ) external onlyOwner {
        _copyTrades[_trader] = copyTrade;
        EVENTS.emitSetCopyTrade(_trader, copyTrade);
    }

    /* ========== PERPS ========== */

    // function _preOrder(
    //     uint256 _id,
    //     uint256 _lastSize,
    //     uint256 _sizeDelta,
    //     uint256 _price,
    //     bool _isIncrease
    // ) internal {}

    function openTrade(
        IGainsTrading.Trade memory trade,
        uint16 _maxSlippageP
    ) external onlyOwner {
        require(
            trade.collateralIndex == 3 || trade.collateralIndex == 1,
            "Collateral index not support"
        );
        CopyTrade memory copyTrade = _copyTrades[trade.user];
        require(copyTrade.enable, "Not exist or disabled");
        if (trade.collateralIndex == 1) {
            trade.collateralAmount =
                (trade.collateralAmount * 10 ** 6) /
                10 ** 18;
            trade.collateralIndex = 3;
        }
        require(
            trade.collateralAmount >= copyTrade.lowestCollateral,
            "Under the lowest collateral"
        );
        require(
            trade.leverage >= copyTrade.lowestLeverage,
            "Under the lowest leverage"
        );
        trade.collateralAmount = copyTrade.collateral;
        trade.leverage = copyTrade.leverage;

        if (copyTrade.reverse) {
            trade.long = !trade.long;
        }

        if (copyTrade.tpP > 0) {
            uint64 diff = (trade.openPrice * copyTrade.tpP) /
                copyTrade.leverage;
            trade.tp = trade.long
                ? trade.openPrice + diff
                : trade.openPrice - diff;
        } else {
            trade.tp = 0;
        }
        if (copyTrade.slP > 0) {
            uint64 diff = (trade.openPrice * copyTrade.slP) /
                copyTrade.leverage;
            trade.sl = trade.long
                ? trade.openPrice - diff
                : trade.openPrice + diff;
        } else {
            trade.sl = 0;
        }

        bytes32 key = keccak256(abi.encodePacked(trade.user, trade.index));
        IGainsTrading.Counter memory counter = GAINS_TRADING.getCounters(
            address(this),
            IGainsTrading.CounterType.TRADE
        );

        TraderPosition memory traderPosition = TraderPosition({
            trader: trade.user,
            index: trade.index,
            __placeholder: 0
        });

        trade.user = address(this);
        trade.index = counter.currentIndex;

        _openTrade(key, traderPosition, trade, _maxSlippageP);
    }

    function closeTradeMarket(
        address _trader,
        uint32 _traderIndex
    ) external onlyOwner {
        bytes32 key = keccak256(abi.encodePacked(_trader, _traderIndex));
        uint32 index = _keyIndexes[key];
        TraderPosition memory traderPosition = _traderPositions[index];
        require(
            traderPosition.trader == _trader &&
                traderPosition.index == _traderIndex,
            "Position not found"
        );
        _closeTradeMarket(index);
    }

    function _openTrade(
        bytes32 key,
        TraderPosition memory traderPosition,
        IGainsTrading.Trade memory trade,
        uint16 _maxSlippageP
    ) internal {
        _keyIndexes[key] = trade.index;
        _traderPositions[trade.index] = traderPosition;
        GAINS_TRADING.openTrade(trade, _maxSlippageP, CONFIGS.feeReceiver());
        uint256 fees = _protocolFee(trade.collateralAmount * trade.leverage) /
            500; //  2 / 1000 open + close
        _lockFund(int256(fees), true);
    }

    function _closeTradeMarket(uint32 _index) internal {
        GAINS_TRADING.closeTradeMarket(_index);
        _chargeProtocolFee(lockedFund);
        lockedFund = 0;
    }

    /* ========== INTERNAL GETTERS ========== */

    function _protocolFee(uint256 _size) internal view returns (uint256) {
        return _size / IConfigs(CONFIGS).protocolFee();
    }

    function _sufficientFund(int256 _amountOut, bool origin) internal view {
        /// @dev origin true => amount as fund asset decimals
        uint256 _fundOut = origin
            ? _abs(_amountOut)
            : _d18ToUsd(_abs(_amountOut));
        require(_fundOut <= availableFund(), "Insufficient available fund");
    }

    /* ========== UTILITIES ========== */

    function _d18ToUsd(uint _amount) internal pure returns (uint) {
        /// @dev convert to fund asset decimals
        return (_amount * 10 ** 6) / 10 ** 18;
    }

    function _usdToD18(uint _amount) internal pure returns (uint) {
        /// @dev convert to fund asset decimals
        return (_amount * 10 ** 18) / 10 ** 6;
    }

    function _abs(int x) internal pure returns (uint z) {
        assembly {
            let mask := sub(0, shr(255, x))
            z := xor(mask, add(mask, x))
        }
    }

    function _isSameSign(int x, int y) internal pure returns (bool) {
        assert(x != 0 && y != 0);
        return (x ^ y) >= 0;
    }
}
