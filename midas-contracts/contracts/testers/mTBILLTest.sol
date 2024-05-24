// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../mTBILL.sol";

//solhint-disable contract-name-camelcase
contract mTBILLTest is mTBILL {
    function _disableInitializers() internal override {}
}
