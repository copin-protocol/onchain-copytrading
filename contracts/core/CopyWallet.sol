// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {ICopyWallet} from "../interfaces/ICopyWallet.sol";
import {IFactory} from "../interfaces/IFactory.sol";
import {IConfigs} from "../interfaces/IConfigs.sol";
import {IEvents} from "../interfaces/IEvents.sol";
import {ITaskCreator} from "../interfaces/ITaskCreator.sol";
import {IERC20} from "../interfaces/token/IERC20.sol";
import {IPerpsMarket} from "../interfaces/SNXv3/IPerpsMarket.sol";
import {Owned} from "../utils/Owned.sol";

abstract contract CopyWallet is ICopyWallet, Owned, ReentrancyGuard {
    /* ========== CONSTANTS ========== */

    bytes32 public constant VERSION = "0.1.0";
    bytes32 internal constant TRACKING_CODE = "COPIN";

    /* ========== IMMUTABLES ========== */

    IFactory internal immutable FACTORY;
    IEvents internal immutable EVENTS;
    IConfigs internal immutable CONFIGS;
    IERC20 internal immutable USD_ASSET; // USD token

    /* ========== STATES ========== */

    uint256 public lockedFund;

    mapping(address => Copytrade) internal _copytrades;
    mapping(uint256 => Position) internal _positions;

    /* ========== CONSTRUCTOR ========== */

    constructor(CopyWalletConstructorParams memory _params) Owned(address(0)) {
        FACTORY = IFactory(_params.factory);
        EVENTS = IEvents(_params.events);
        CONFIGS = IConfigs(_params.configs);
        USD_ASSET = IERC20(_params.usdAsset);
    }

    /* ========== VIEWS ========== */

    function ethToUsd(uint256 _fee) public view virtual returns (uint256) {}

    function availableFund() public view override returns (uint256) {
        return USD_ASSET.balanceOf(address(this)) - lockedFund;
    }

    function availableFundD18() public view override returns (uint256) {
        return _usdToD18(availableFund());
    }

    function lockedFundD18() public view override returns (uint256) {
        return _usdToD18(lockedFund);
    }

    function positions(uint256 _key) public view returns (Position memory) {
        return _positions[_key];
    }

    /* ========== INIT & OWNERSHIP ========== */

    function init(address _owner) external override {
        require(msg.sender == address(FACTORY), "CopyWallet: Only factory");
        _setInitialOwnership(_owner);
        _perpInit();
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

    /* ========== OWNER ACTIONS ========== */

    function modifyFund(int256 _amount) external onlyOwner {
        _modifyFund(_amount);
    }

    function withdrawEth(uint256 _amount) external onlyOwner {
        _withdrawEth(_amount);
    }

    function copy(address _trader, uint256 _market) external virtual {}

    function closePosition(uint256 _market) external virtual onlyOwner {}

    function createCopytrade(
        address _trader,
        Copytrade memory params
    ) external onlyOwner {
        require(
            _copytrades[_trader].margin == 0,
            "CopyWallet: Copytrade is exist"
        );
        _setCopytrade(_trader, params);
    }

    function updateCopytrade(
        address _trader,
        Copytrade memory params
    ) external onlyOwner {
        require(
            _copytrades[_trader].margin > 0,
            "CopyWallet: Copytrade is not exist"
        );
        _setCopytrade(_trader, params);
    }

    function _setCopytrade(address _trader, Copytrade memory params) internal {
        require(_trader != address(0), "CopyWallet: InvalidTrader");
        require(
            params.margin >= CONFIGS.minMargin() &&
                params.margin <= CONFIGS.maxMargin(),
            "CopyWallet: Invalid margin"
        );
        require(
            params.leverage >= CONFIGS.minLeverage() &&
                params.leverage <= CONFIGS.maxLeverage(),
            "CopyWallet: Invalid leverage"
        );
        require(
            params.maxMarginPerOI == 0 ||
                params.maxMarginPerOI >= params.margin,
            "CopyWallet: Invalid max margin per OI"
        );
        _copytrades[_trader] = params;
    }

    /* ========== FUNDS ========== */

    receive() external payable {}

    function _withdrawEth(uint256 _amount) internal {
        if (_amount > 0) {
            (bool success, ) = payable(msg.sender).call{value: _amount}("");
            require(success, "CopyWallet: ETH withdrawal failed");
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

    function _chargeExecutorFee(
        address _executor,
        uint256 multiplier
    ) internal returns (uint256) {
        uint256 fee = CONFIGS.executorFee();
        fee = fee * multiplier;
        uint256 feeUsd = ethToUsd(fee);
        address feeReceiver = CONFIGS.feeReceiver();
        if (feeUsd <= availableFund()) {
            /// @dev failed Synthetix asset transfer will revert and not return false if unsuccessful
            USD_ASSET.transfer(feeReceiver, feeUsd);
        } else {
            /// @dev failed Synthetix asset transfer will revert and not return false if unsuccessful
            USD_ASSET.transferFrom(owner, feeReceiver, feeUsd);
        }
        EVENTS.emitChargeExecutorFee({
            executor: _executor,
            receiver: feeReceiver,
            fee: fee,
            feeUsd: feeUsd
        });
        return fee;
    }

    function _chargeProtocolFee(
        uint256 _sizeDelta,
        uint256 _price,
        uint256 _feeUsd
    ) internal {
        address feeReceiver = CONFIGS.feeReceiver();
        USD_ASSET.transfer(feeReceiver, _feeUsd);
        EVENTS.emitChargeProtocolFee({
            receiver: feeReceiver,
            sizeDelta: _sizeDelta,
            price: _price,
            feeUsd: _feeUsd
        });
    }

    /* ========== PERPS ========== */

    // function _preOrder(
    //     uint256 _id,
    //     uint256 _lastSize,
    //     uint256 _sizeDelta,
    //     uint256 _price,
    //     bool _isIncrease
    // ) internal {}

    function _postOrder(
        uint256 _id,
        address _trader,
        uint256 _lastTraderSize,
        uint256 _lastSize,
        uint256 _sizeDelta,
        uint256 _price,
        bool _isIncrease
    ) internal {
        Position memory position = _positions[_id];
        uint256 delta = _lastSize > position.lastSize
            ? _lastSize - position.lastSize
            : 0;

        if (delta > 0) {
            if (delta > position.lastSizeDelta) delta = position.lastSizeDelta;
            uint256 chargeFees = _protocolFee(
                (delta * position.lastPrice * 2) / 10 ** 18
            );
            if (chargeFees > position.lastFees) chargeFees = position.lastFees;
            lockedFund -= _d18ToUsd(position.lastFees);
            _chargeProtocolFee(
                delta,
                position.lastPrice,
                _d18ToUsd(chargeFees)
            );
        }
        uint256 fees = 0;
        if (_isIncrease) {
            fees = _protocolFee((_sizeDelta * _price * 2) / 10 ** 18);
            _lockFund(int256(fees), false);
        }
        _positions[_id] = Position({
            trader: _trader,
            lastTraderSize: _lastTraderSize,
            lastSize: _lastSize,
            lastSizeDelta: _sizeDelta,
            lastPrice: _price,
            lastFees: fees
        });
    }

    function _perpInit() internal virtual {}

    /* ========== INTERNAL GETTERS ========== */

    function _protocolFee(uint256 _size) internal view returns (uint256) {
        return _size / IConfigs(CONFIGS).protocolFee();
    }

    function _sufficientFund(int256 _amountOut, bool origin) internal view {
        /// @dev origin true => amount as fund asset decimals
        uint256 _fundOut = origin
            ? _abs(_amountOut)
            : _d18ToUsd(_abs(_amountOut));
        require(
            _fundOut <= availableFund(),
            "CopyWallet: Insufficient available fund"
        );
    }

    /* ========== UTILITIES ========== */

    function _d18ToUsd(uint256 _amount) internal view returns (uint256) {
        /// @dev convert to fund asset decimals
        return (_amount * 10 ** USD_ASSET.decimals()) / 10 ** 18;
    }

    function _usdToD18(uint256 _amount) internal view returns (uint256) {
        /// @dev convert to fund asset decimals
        return (_amount * 10 ** 18) / 10 ** USD_ASSET.decimals();
    }

    function _abs(int256 x) internal pure returns (uint256 z) {
        assembly {
            let mask := sub(0, shr(255, x))
            z := xor(mask, add(mask, x))
        }
    }

    function _isSameSign(int256 x, int256 y) internal pure returns (bool) {
        assert(x != 0 && y != 0);
        return (x ^ y) >= 0;
    }
}
