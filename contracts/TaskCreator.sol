// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IFactory} from "./interfaces/IFactory.sol";
import {AutomateTaskCreator} from "./utils/gelato/AutomateTaskCreator.sol";
import {ModuleData} from "./utils/gelato/Types.sol";

contract TaskCreator is AutomateTaskCreator {
    address public immutable factory;
    mapping(bytes32 => address) _taskOwners;

    error OnlyCopytrades();

    constructor(
        address _factory,
        address _automate
    ) AutomateTaskCreator(_automate) {
        factory = _factory;
    }

    modifier onlyCopytrades() {
        if (!IFactory(factory).accounts(msg.sender)) {
            revert OnlyCopytrades();
        }
        _;
    }

    function cancelTask(bytes32 _gelatoTaskId) external onlyCopytrades {
        require(_taskOwners[_gelatoTaskId] == msg.sender, "UNAUTHORIZED");
        _cancelTask(_gelatoTaskId);
    }

    function createTask(
        bytes memory execData,
        ModuleData memory moduleData
    ) external onlyCopytrades returns (bytes32 _gelatoTaskId) {
        _gelatoTaskId = _createTask(
            msg.sender,
            execData,
            moduleData,
            address(0)
        );
        _taskOwners[_gelatoTaskId] = msg.sender;
    }

    // fund executions by depositing to 1Balance
    // function depositFunds1Balance(
    //     address token,
    //     uint256 amount
    // ) external payable {
    //     _depositFunds1Balance(amount, token, address(this));
    // }
}
