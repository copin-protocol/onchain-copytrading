// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

struct Log {
    uint256 index; // Index of the log in the block
    uint256 timestamp; // Timestamp of the block containing the log
    bytes32 txHash; // Hash of the transaction containing the log
    uint256 blockNumber; // Number of the block containing the log
    bytes32 blockHash; // Hash of the block containing the log
    address source; // Address of the contract that emitted the log
    bytes32[] topics; // Indexed topics of the log
    bytes data; // Data of the log
}

interface ILogAutomation {
    function checkLog(
        Log calldata log,
        bytes memory checkData
    ) external returns (bool upkeepNeeded, bytes memory performData);

    function performUpkeep(bytes calldata performData) external;
}

contract TestSignal is ILogAutomation {
    address trader;
    event DelayedOrderSubmitted(
        address indexed account,
        address market,
        int256 sizeDelta
    );
    // event DelayedOrderSubmitted(address indexed account);

    constructor(address _trader) {
        trader = _trader;
    }

    function checkLog(
        Log calldata log,
        bytes memory checkData
    ) external pure returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = true;
        (, int256 sizeDelta, , , , , , ) = abi.decode(
            log.data,
            (bool, int256, uint256, uint256, uint256, uint256, uint256, bytes32)
        );
        address account = bytes32ToAddress(log.topics[1]);
        performData = abi.encode(account, log.source, sizeDelta);
    }

    function performUpkeep(bytes calldata performData) external override {
        // address account = abi.decode(performData, (address));
        (address account, address market, int256 sizeDelta) = abi.decode(
            performData,
            (address, address, int256)
        );
        emit DelayedOrderSubmitted(account, market, sizeDelta);
    }

    function bytes32ToAddress(bytes32 _address) public pure returns (address) {
        return address(uint160(uint256(_address)));
    }
}
