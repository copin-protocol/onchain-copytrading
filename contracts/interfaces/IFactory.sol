// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IFactory {
    event NewCopyWallet(
        address indexed creator,
        address indexed account,
        bytes32 version
    );

    event CopyWalletImplementationUpgraded(address implementation);

    error FailedToInitCopyWallet(bytes data);

    error CopyWalletFailedToFetchVersion(bytes data);

    error CannotUpgrade();

    error CopyWalletDoesNotExist();

    function canUpgrade() external view returns (bool);

    function implementation() external view returns (address);

    function accounts(address _account) external view returns (bool);

    function getCopyWalletOwner(
        address _account
    ) external view returns (address);

    function getCopyWalletsOwnedBy(
        address _owner
    ) external view returns (address[] memory);

    function updateCopyWalletOwnership(
        address _newOwner,
        address _oldOwner
    ) external;

    function newCopyWallet() external returns (address payable accountAddress);

    /// @dev this *will* impact all existing accounts
    /// @dev future accounts will also point to this new implementation (until
    /// upgradeCopyWalletImplementation() is called again with a newer implementation)
    /// @dev *DANGER* this function does not check the new implementation for validity,
    /// thus, a bad upgrade could result in severe consequences.
    function upgradeCopyWalletImplementation(address _implementation) external;

    /// @dev cannot be undone
    function removeUpgradability() external;
}
