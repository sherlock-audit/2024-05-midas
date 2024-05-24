// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../access/Blacklistable.sol";

contract BlacklistableTester is Blacklistable {
    function initialize(address _accessControl) external initializer {
        __Blacklistable_init(_accessControl);
    }

    function initializeWithoutInitializer(address _accessControl) external {
        __Blacklistable_init(_accessControl);
    }

    function onlyNotBlacklistedTester(address account)
        external
        onlyNotBlacklisted(account)
    {}

    function _disableInitializers() internal override {}
}
