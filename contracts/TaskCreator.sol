// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IFactory} from "./interfaces/IFactory.sol";
import {AutomateTaskCreator} from "./utils/gelato/AutomateTaskCreator.sol";
import {ModuleData} from "./utils/gelato/Types.sol";

contract TaskCreator is AutomateTaskCreator {

    /* ========== IMMUTABLES ========== */

    address public immutable factory;

    /* ========== STATE ========== */

    mapping(bytes32 => address) _taskOwners;

    /* ========== ERRORS ========== */

    error OnlyCopyWallets();

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _factory,
        address _automate
    ) AutomateTaskCreator(_automate) {
        factory = _factory;
    }

    /* ========== MODIFIERS ========== */

    modifier onlyCopyWallets() {
        if (!IFactory(factory).accounts(msg.sender)) {
            revert OnlyCopyWallets();
        }
        _;
    }

    /* ========== MUTATES ========== */

    function cancelTask(bytes32 _gelatoTaskId) external onlyCopyWallets {
        require(_taskOwners[_gelatoTaskId] == msg.sender, "UNAUTHORIZED");
        _cancelTask(_gelatoTaskId);
    }

    function createTask(
        bytes memory execData,
        ModuleData memory moduleData
    ) external onlyCopyWallets returns (bytes32 _gelatoTaskId) {
        _gelatoTaskId = _createTask(
            msg.sender,
            execData,
            moduleData,
            address(0)
        );
        _taskOwners[_gelatoTaskId] = msg.sender;
    }
}
