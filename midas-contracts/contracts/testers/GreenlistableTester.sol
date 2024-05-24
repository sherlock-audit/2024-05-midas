// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../access/Greenlistable.sol";

contract GreenlistableTester is Greenlistable {
    function initialize(address _accessControl) external initializer {
        __Greenlistable_init(_accessControl);
    }

    function initializeWithoutInitializer(address _accessControl) external {
        __Greenlistable_init(_accessControl);
    }

    function onlyGreenlistedTester(address account)
        external
        onlyGreenlisted(account)
    {}

    function _disableInitializers() internal override {}
}
