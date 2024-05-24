// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./WithMidasAccessControl.sol";

/**
 * @title Greenlistable
 * @notice Base contract that implements basic functions and modifiers
 * to work with greenlistable
 * @author RedDuck Software
 */
abstract contract Greenlistable is WithMidasAccessControl {
    /**
     * @dev checks that a given `account`
     * have GREENLISTED_ROLE
     */
    modifier onlyGreenlisted(address account) {
        _onlyGreenlisted(account);
        _;
    }

    /**
     * @dev upgradeable pattern contract`s initializer
     * @param _accessControl MidasAccessControl contract address
     */
    // solhint-disable func-name-mixedcase
    function __Greenlistable_init(address _accessControl)
        internal
        onlyInitializing
    {
        __WithMidasAccessControl_init(_accessControl);
    }

    /**
     * @dev checks that a given `account` doesnt
     * have GREENLISTED_ROLE
     */
    function _onlyGreenlisted(address account)
        private
        view
        onlyRole(GREENLISTED_ROLE, account)
    {}
}
