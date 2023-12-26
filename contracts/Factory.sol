// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IFactory} from "./interfaces/IFactory.sol";
import {CopytradeProxy} from "./CopytradeProxy.sol";
import {Owned} from "./utils/Owned.sol";

contract Factory is IFactory, Owned {
    bool public canUpgrade = true;

    address public implementation;

    mapping(address accounts => bool exist) public accounts;

    mapping(address owner => address[] accounts) internal ownerCopytrades;

    constructor(address _owner) Owned(_owner) {}

    function getCopytradeOwner(
        address _account
    ) public view override returns (address) {
        if (!accounts[_account]) revert CopytradeDoesNotExist();
        (bool success, bytes memory data) = _account.staticcall(
            abi.encodeWithSignature("owner()")
        );
        assert(success);
        return abi.decode(data, (address));
    }

    function getCopytradesOwnedBy(
        address _owner
    ) external view override returns (address[] memory) {
        return ownerCopytrades[_owner];
    }

    function updateCopytradeOwnership(
        address _newOwner,
        address _oldOwner
    ) external override {
        if (!accounts[msg.sender]) revert CopytradeDoesNotExist();
        uint256 length = ownerCopytrades[_oldOwner].length;

        for (uint256 i = 0; i < length; ) {
            if (ownerCopytrades[_oldOwner][i] == msg.sender) {
                ownerCopytrades[_oldOwner][i] = ownerCopytrades[_oldOwner][
                    length - 1
                ];
                ownerCopytrades[_oldOwner].pop();
                ownerCopytrades[_newOwner].push(msg.sender);

                return;
            }

            unchecked {
                ++i;
            }
        }
    }

    function newCopytrade(
        address initialExecutor
    ) external override returns (address payable accountAddress) {
        accountAddress = payable(address(new CopytradeProxy(address(this))));
        accounts[accountAddress] = true;
        ownerCopytrades[msg.sender].push(accountAddress);

        (bool success, bytes memory data) = accountAddress.call(
            abi.encodeWithSignature(
                "init(address,address)",
                msg.sender,
                initialExecutor
            )
        );
        if (!success) revert FailedToInitCopytrade(data);

        (success, data) = accountAddress.call(
            abi.encodeWithSignature("VERSION()")
        );
        if (!success) revert CopytradeFailedToFetchVersion(data);

        emit NewCopytrade({
            creator: msg.sender,
            account: accountAddress,
            version: abi.decode(data, (bytes32))
        });
    }

    function upgradeCopytradeImplementation(
        address _implementation
    ) external override onlyOwner {
        if (!canUpgrade) revert CannotUpgrade();
        implementation = _implementation;
        emit CopytradeImplementationUpgraded({implementation: _implementation});
    }

    function removeUpgradability() external override onlyOwner {
        canUpgrade = false;
    }
}
