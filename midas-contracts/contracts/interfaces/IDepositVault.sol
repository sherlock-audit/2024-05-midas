// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./IManageableVault.sol";

/**
 * @title IDepositVault
 * @author RedDuck Software
 */
interface IDepositVault is IManageableVault {
    /**
     * @param caller function caller (msg.sender)
     * @param newValue new min amount to deposit value
     */
    event SetMinAmountToDeposit(address indexed caller, uint256 newValue);

    /**
     * @param id unique id of a deposit
     * @param user address that initiated the deposit
     * @param usdTokenIn address of usd token
     * @param amount amount of `usdTokenIn`
     */
    event Deposit(
        uint256 indexed id,
        address indexed user,
        address indexed usdTokenIn,
        uint256 amount
    );

    /**
     * @param user address that was freed from min deposit check
     */
    event FreeFromMinDeposit(address indexed user);

    /**
     * @notice first step of the depositing proccess.
     * Transfers usd token from the user.
     * Then request should be validated off-chain and if
     * everything is okay, admin should mint necessary amount
     * of mTBILL token back to user
     * @param tokenIn address of USD token in
     * @param amountIn amount of `tokenIn` that will be taken from user
     */
    function deposit(address tokenIn, uint256 amountIn) external;

    /**
     * @notice frees given `user` from the minimal deposit
     * amount validation in `initiateDepositRequest`
     * @param user address of user
     */
    function freeFromMinDeposit(address user) external;

    /**
     * @notice sets new minimal amount to deposit in EUR.
     * can be called only from vault`s admin
     * @param newValue new min. deposit value
     */
    function setMinAmountToDeposit(uint256 newValue) external;
}
