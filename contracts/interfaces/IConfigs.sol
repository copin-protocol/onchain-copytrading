// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IConfigs {
    event ProtocolFeeSet(uint256 protocolFee);

    event FeeReceiverSet(address feeReceiver);

    function protocolFee() external view returns (uint256);

    function feeReceiver() external view returns (address);

    function setProtocolFee(uint256 _protocolFee) external;

    function setFeeReceiver(address _feeReceiver) external;
}
