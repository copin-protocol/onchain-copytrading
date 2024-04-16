// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IConfigs {
    event ExecutorFeeSet(uint256 executorFee);

    event ProtocolFeeSet(uint256 protocolFee);

    event FeeReceiverSet(address feeReceiver);

    function executorFee() external view returns (uint256);

    function protocolFee() external view returns (uint256);

    function minMargin() external view returns (uint256);

    function maxMargin() external view returns (uint256);

    function minLeverage() external view returns (uint256);

    function maxLeverage() external view returns (uint256);

    function feeReceiver() external view returns (address);

    function setExecutorFee(uint256 _executorFee) external;

    function setProtocolFee(uint256 _protocolFee) external;

    function setFeeReceiver(address _feeReceiver) external;
}
