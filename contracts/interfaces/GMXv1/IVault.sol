// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IVault {
    function getMaxPrice(address _token) external view returns (uint256);
    function getMinPrice(address _token) external view returns (uint256);
    function getPosition(address _account, address _collateralToken, address _indexToken, bool _isLong) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool, uint256);
    // size collateral averagePrice entryFundingRate reserveAmount realisedPnl isWin lastIncreasedTime
}