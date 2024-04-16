// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IFactory} from "./interfaces/IFactory.sol";
import {CopyWalletProxy} from "./CopyWalletProxy.sol";
import {Owned} from "./utils/Owned.sol";

contract Factory is IFactory, Owned {
    /* ========== STATE ========== */

    bool public canUpgrade = true;
    address public implementation;

    mapping(address wallets => bool exist) public wallets;
    mapping(address owner => address[] wallets) internal ownerCopyWallets;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _owner) Owned(_owner) {}

    /* ========== GETTERS ========== */

    function getCopyWalletOwner(
        address _wallet
    ) public view override returns (address) {
        if (!wallets[_wallet]) revert CopyWalletDoesNotExist();
        (bool success, bytes memory data) = _wallet.staticcall(
            abi.encodeWithSignature("owner()")
        );
        assert(success);
        return abi.decode(data, (address));
    }

    function getCopyWalletsOwnedBy(
        address _owner
    ) external view override returns (address[] memory) {
        return ownerCopyWallets[_owner];
    }

    /* ========== MUTATES ========== */

    function updateCopyWalletOwnership(
        address _newOwner,
        address _oldOwner
    ) external override {
        if (!wallets[msg.sender]) revert CopyWalletDoesNotExist();
        uint256 length = ownerCopyWallets[_oldOwner].length;

        for (uint256 i = 0; i < length; ) {
            if (ownerCopyWallets[_oldOwner][i] == msg.sender) {
                ownerCopyWallets[_oldOwner][i] = ownerCopyWallets[_oldOwner][
                    length - 1
                ];
                ownerCopyWallets[_oldOwner].pop();
                ownerCopyWallets[_newOwner].push(msg.sender);

                return;
            }

            unchecked {
                ++i;
            }
        }
    }

    function newCopyWallet()
        external
        override
        returns (address payable walletAddress)
    {
        walletAddress = payable(address(new CopyWalletProxy(address(this))));
        wallets[walletAddress] = true;
        ownerCopyWallets[msg.sender].push(walletAddress);

        (bool success, bytes memory data) = walletAddress.call(
            abi.encodeWithSignature("init(address)", msg.sender)
        );
        if (!success) revert FailedToInitCopyWallet(data);

        (success, data) = walletAddress.call(
            abi.encodeWithSignature("VERSION()")
        );
        if (!success) revert CopyWalletFailedToFetchVersion(data);

        emit NewCopyWallet({
            creator: msg.sender,
            wallet: walletAddress,
            version: abi.decode(data, (bytes32))
        });
    }

    /* ========== UPGRADE ========== */

    function upgradeCopyWalletImplementation(
        address _implementation
    ) external override onlyOwner {
        if (!canUpgrade) revert CannotUpgrade();
        implementation = _implementation;
        emit CopyWalletImplementationUpgraded({
            implementation: _implementation
        });
    }

    function removeUpgradability() external override onlyOwner {
        canUpgrade = false;
    }
}
