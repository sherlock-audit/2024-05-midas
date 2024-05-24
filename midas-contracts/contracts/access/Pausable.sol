// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "../access/WithMidasAccessControl.sol";

/**
 * @title Pausable
 * @notice Base contract that implements basic functions and modifiers
 * with pause functionality
 * @author RedDuck Software
 */
abstract contract Pausable is WithMidasAccessControl, PausableUpgradeable {
    /**
     * @dev checks that a given `account`
     * has a determinedPauseAdminRole
     */
    modifier onlyPauseAdmin() {
        _onlyRole(pauseAdminRole(), msg.sender);
        _;
    }

    /**
     * @dev upgradeable pattern contract`s initializer
     * @param _accessControl MidasAccessControl contract address
     */
    // solhint-disable-next-line func-name-mixedcase
    function __Pausable_init(address _accessControl) internal onlyInitializing {
        __WithMidasAccessControl_init(_accessControl);
    }

    function pause() external onlyPauseAdmin {
        _pause();
    }

    function unpause() external onlyPauseAdmin {
        _unpause();
    }

    /**
     * @dev virtual function to determine pauseAdmin role
     */
    function pauseAdminRole() public view virtual returns (bytes32);
}
