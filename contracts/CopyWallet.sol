// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {ILogAutomation, Log} from "@chainlink/contracts/src/v0.8/automation/interfaces/ILogAutomation.sol";
import {IGainsTrading} from "./interfaces/IGainsTrading.sol";
import {ICopyWallet} from "./interfaces/ICopyWallet.sol";
import {IFactory} from "./interfaces/IFactory.sol";
import {IAutomationRegistrar} from "./interfaces/IAutomationRegistrar.sol";
import {IConfigs} from "./interfaces/IConfigs.sol";
import {IEvents} from "./interfaces/IEvents.sol";
import {IERC20} from "./interfaces/token/IERC20.sol";
import {Owned} from "./utils/Owned.sol";

contract CopyWallet is Owned, ReentrancyGuard, ILogAutomation, ICopyWallet {
    /* ========== CONSTANTS ========== */

    bytes32 public constant VERSION = "0.1.0";

    /* ========== IMMUTABLES ========== */

    IFactory internal immutable FACTORY;
    IEvents internal immutable EVENTS;
    IConfigs internal immutable CONFIGS;
    IERC20 internal immutable USD_ASSET; // USD token
    IGainsTrading internal immutable GAINS_TRADING;
    IERC20 internal immutable LINK; // LINK token
    IAutomationRegistrar internal immutable AUTOMATION_REGISTRAR;

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
        LINK = IERC20(_params.link);
        AUTOMATION_REGISTRAR = IAutomationRegistrar(
            _params.automationRegistrar
        );
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

    function checkLog(
        Log calldata log,
        bytes memory
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        (
            ,
            ,
            address user,
            uint32 index,
            uint16 pairIndex,
            uint24 leverage,
            bool long,
            ,
            uint8 collateralIndex,
            ,
            uint120 collateralAmount,
            ,
            ,
            ,
            bool open,
            uint64 price,
            ,
            ,
            ,
            ,
            uint256 collateralPriceUsd
        ) = abi.decode(
                log.data,
                (
                    address,
                    uint32,
                    address,
                    uint32,
                    uint16,
                    uint24,
                    bool,
                    bool,
                    uint8,
                    uint8,
                    uint120,
                    uint64,
                    uint64,
                    uint192,
                    bool,
                    uint64,
                    uint64,
                    uint256,
                    int256,
                    uint256,
                    uint256
                )
            );
        if (collateralIndex != 3 && collateralIndex != 1) {
            return (false, bytes(""));
        }
        CopyTrade memory copyTrade = _copyTrades[user];
        if (!copyTrade.enable) {
            return (false, bytes(""));
        }

        bytes32 key = keccak256(abi.encodePacked(user, index));
        IGainsTrading.Trade memory trade;
        trade.isOpen = open;

        if (!open) {
            trade.index = _keyIndexes[key];
            TraderPosition memory traderPosition = _traderPositions[
                trade.index
            ];
            if (
                traderPosition.trader == address(0) ||
                traderPosition.trader != user ||
                traderPosition.index != index
            ) {
                return (false, bytes(""));
            }
        } else {
            if (collateralIndex == 1) {
                collateralAmount = (collateralAmount * 10 ** 6) / 10 ** 18;
            }
            if (
                collateralAmount < copyTrade.lowestCollateral ||
                leverage < copyTrade.lowestLeverage
            ) {
                return (false, bytes(""));
            }

            trade.collateralIndex = 3;
            trade.pairIndex = pairIndex;
            trade.collateralAmount = copyTrade.collateral;
            trade.openPrice = price;
            trade.leverage = copyTrade.leverage;

            if (copyTrade.reverse) {
                trade.long = !long;
            }

            if (copyTrade.tpP > 0) {
                uint64 diff = (price * copyTrade.tpP) / copyTrade.leverage;
                trade.tp = trade.long ? price + diff : price - diff;
            } else {
                trade.tp = 0;
            }
            if (copyTrade.slP > 0) {
                uint64 diff = (trade.openPrice * copyTrade.slP) /
                    copyTrade.leverage;
                trade.sl = trade.long ? price - diff : price + diff;
            } else {
                trade.sl = 0;
            }

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
            return (true, abi.encode(key, traderPosition, trade));
        }
    }

    event Test();

    function performUpkeep(bytes calldata performData) external override {
        emit Test();
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

    function openTrade(IGainsTrading.Trade memory trade) external onlyOwner {
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

        _openTrade(key, traderPosition, trade);
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
        IGainsTrading.Trade memory trade
    ) internal {
        _keyIndexes[key] = trade.index;
        _traderPositions[trade.index] = traderPosition;
        GAINS_TRADING.openTrade(trade, 300, CONFIGS.feeReceiver());
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

    /* ========== AUTOMATION ========== */

    function registerSignal() external onlyOwner {
        registerAndPredictID(
            IAutomationRegistrar.RegistrationParams({
                name: "MARKET_EXECUTED",
                encryptedEmail: "",
                upkeepContract: address(this),
                gasLimit: 3000000,
                adminAddress: owner,
                triggerType: 1,
                checkData: "",
                triggerConfig: abi.encode(
                    address(GAINS_TRADING),
                    0,
                    0xbbd5cfa7b4ec0d44d4155fcaad32af9cf7e65799d6b8b08f233b930de7bcd9a8,
                    "",
                    "",
                    ""
                ),
                offchainConfig: "",
                amount: 1000000000000000000
            })
        );
    }

    function registerAndPredictID(
        IAutomationRegistrar.RegistrationParams memory params
    ) public {
        // LINK must be approved for transfer - this can be done every time or once
        // with an infinite approval
        LINK.approve(address(AUTOMATION_REGISTRAR), 2 ** 256 - 1);
        uint256 upkeepID = AUTOMATION_REGISTRAR.registerUpkeep(params);
        if (upkeepID != 0) {
            EVENTS.emitRegisterSignal(params.name, upkeepID);
        }
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

    function _bytes32ToAddress(
        bytes32 _address
    ) internal pure returns (address) {
        return address(uint160(uint256(_address)));
    }
}
