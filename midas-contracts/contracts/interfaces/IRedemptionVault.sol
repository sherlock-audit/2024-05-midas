// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./IManageableVault.sol";

/**
 * @title IRedemptionVault
 * @author RedDuck Software
 */
interface IRedemptionVault is IManageableVault {
    /**
     * @param id unique id of a redemption
     * @param user address that initiated the redeem
     * @param usdTokenOut address of usd token that user
     * wants to receive after redeem
     * @param amount amount of `usdTokenOut`
     */
    event Redeem(
        uint256 indexed id,
        address indexed user,
        address indexed usdTokenOut,
        uint256 amount
    );

    /**
     * @notice Transfers mTBILL from the user to the admin.
     * After that admin should validate the redemption and transfer
     * selected `tokenOut` back to user
     * @param tokenOut stable coin token address to redeem to
     * @param amountTBillIn amount of mTBILL to redeem
     */
    function redeem(address tokenOut, uint256 amountTBillIn) external;
}
