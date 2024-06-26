// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IPositionRouter {
  function createIncreasePosition(
      address[] memory _path,
      address _indexToken,
      uint256 _amountIn,
      uint256 _minOut,
      uint256 _sizeDelta,
      bool _isLong,
      uint256 _acceptablePrice,
      uint256 _executionFee,
      bytes32 _referralCode,
      address _callbackTarget
  ) external payable returns (bytes32);

  function createDecreasePosition(
      address[] memory _path,
      address _indexToken,
      uint256 _collateralDelta,
      uint256 _sizeDelta,
      bool _isLong,
      address _receiver,
      uint256 _acceptablePrice,
      uint256 _minOut,
      uint256 _executionFee,
      bool _withdrawETH,
      address _callbackTarget
  ) external payable returns (bytes32);

  function minExecutionFee() external payable returns (uint256);
}
