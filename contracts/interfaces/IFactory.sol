// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IFactory {
    event NewCopytrade(
        address indexed creator,
        address indexed account,
        bytes32 version
    );

    event CopytradeImplementationUpgraded(address implementation);

    error FailedToInitCopytrade(bytes data);

    error CopytradeFailedToFetchVersion(bytes data);

    error CannotUpgrade();

    error CopytradeDoesNotExist();

    function canUpgrade() external view returns (bool);

    function implementation() external view returns (address);

    function accounts(address _account) external view returns (bool);

    function getCopytradeOwner(
        address _account
    ) external view returns (address);

    function getCopytradesOwnedBy(
        address _owner
    ) external view returns (address[] memory);

    function updateCopytradeOwnership(
        address _newOwner,
        address _oldOwner
    ) external;

    function newCopytrade(
        address initialExecutor
    ) external returns (address payable accountAddress);

    /// @dev this *will* impact all existing accounts
    /// @dev future accounts will also point to this new implementation (until
    /// upgradeCopytradeImplementation() is called again with a newer implementation)
    /// @dev *DANGER* this function does not check the new implementation for validity,
    /// thus, a bad upgrade could result in severe consequences.
    function upgradeCopytradeImplementation(address _implementation) external;

    /// @dev cannot be undone
    function removeUpgradability() external;
}
