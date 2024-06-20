// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";

import "./interfaces/IMTbill.sol";
import "./access/Blacklistable.sol";

/**
 * @title mTBILL
 * @author RedDuck Software
 */
//solhint-disable contract-name-camelcase
contract mTBILL is ERC20PausableUpgradeable, Blacklistable, IMTbill {
    /**
     * @notice metadata key => metadata value
     */
    mapping(bytes32 => bytes) public metadata;

    /**
     * @dev leaving a storage gap for futures updates
     */
    uint256[50] private __gap;

    /**
     * @notice upgradeable pattern contract`s initializer
     * @param _accessControl address of MidasAccessControll contract
     */
    function initialize(address _accessControl) external initializer {
        __Blacklistable_init(_accessControl);
        __ERC20_init("mTBILL", "mTBILL");
    }

    /**
     * @inheritdoc IMTbill
     */
    function mint(address to, uint256 amount)
        external
        onlyRole(M_TBILL_MINT_OPERATOR_ROLE, msg.sender)
    {
        _mint(to, amount);
    }

    /**
     * @inheritdoc IMTbill
     */
    function burn(address from, uint256 amount)
        external
        onlyRole(M_TBILL_BURN_OPERATOR_ROLE, msg.sender)
    {
        _burn(from, amount);
    }

    /**
     * @inheritdoc IMTbill
     */
    function pause()
        external
        override
        onlyRole(M_TBILL_PAUSE_OPERATOR_ROLE, msg.sender)
    {
        _pause();
    }

    /**
     * @inheritdoc IMTbill
     */
    function unpause()
        external
        override
        onlyRole(M_TBILL_PAUSE_OPERATOR_ROLE, msg.sender)
    {
        _unpause();
    }

    /**
     * @inheritdoc IMTbill
     */
    function setMetadata(bytes32 key, bytes memory data)
        external
        onlyRole(DEFAULT_ADMIN_ROLE, msg.sender)
    {
        metadata[key] = data;
    }

    /**
     * @dev overrides _beforeTokenTransfer function to ban
     * blaclisted users from using the token functions
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20PausableUpgradeable) {
        if (to != address(0)) {
            _onlyNotBlacklisted(from);
            _onlyNotBlacklisted(to);
        }

        ERC20PausableUpgradeable._beforeTokenTransfer(from, to, amount);
    }
}
