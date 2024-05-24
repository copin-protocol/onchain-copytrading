// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IAutomationRegistrar {
    struct RegistrationParams {
        string name;
        bytes encryptedEmail;
        address upkeepContract;
        uint32 gasLimit;
        address adminAddress;
        uint8 triggerType;
        bytes checkData;
        bytes triggerConfig;
        bytes offchainConfig;
        uint96 amount;
    }

    struct LogTriggerConfig {
        address contractAddress;
        uint8 filterSelector;
        bytes32 topic0;
        bytes32 topic1;
        bytes32 topic2;
        bytes32 topic3;
    }

    function registerUpkeep(
        RegistrationParams calldata requestParams
    ) external returns (uint256);
}
