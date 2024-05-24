// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import {IERC20Upgradeable as IERC20} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {IERC20MetadataUpgradeable as IERC20Metadata} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";

import {SafeERC20Upgradeable as SafeERC20} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {EnumerableSetUpgradeable as EnumerableSet} from "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

import "./interfaces/IDepositVault.sol";
import "./interfaces/IMTbill.sol";
import "./interfaces/IDataFeed.sol";

import "./access/Greenlistable.sol";
import "./abstract/ManageableVault.sol";

import "./libraries/DecimalsCorrectionLibrary.sol";

/**
 * @title DepositVault
 * @notice Smart contract that handles mTBILL minting
 * @author RedDuck Software
 */
contract DepositVault is ManageableVault, IDepositVault {
    using EnumerableSet for EnumerableSet.AddressSet;
    using DecimalsCorrectionLibrary for uint256;
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    /**
     * @notice minimal USD amount in EUR for first user`s deposit
     */
    uint256 public minAmountToDepositInEuro;

    /**
     * @notice last deposit request id
     */
    Counters.Counter public lastRequestId;

    /**
     * @notice EUR/USD data feed
     */
    IDataFeed public eurUsdDataFeed;

    /**
     * @dev depositor address => amount deposited
     */
    mapping(address => uint256) public totalDeposited;

    /**
     * @notice users restricted from depositin minDepositAmountInEuro
     */
    mapping(address => bool) public isFreeFromMinDeposit;

    /**
     * @dev leaving a storage gap for futures updates
     */
    uint256[50] private __gap;

    /**
     * @notice upgradeable pattern contract`s initializer
     * @param _ac address of MidasAccessControll contract
     * @param _mTBILL address of mTBILL token
     * @param _eurUsdDataFeed address of CL`s data feed EUR/USD
     * @param _minAmountToDepositInEuro initial value for minAmountToDepositInEuro
     * @param _usdReceiver address of usd tokens receiver
     */
    function initialize(
        address _ac,
        address _mTBILL,
        address _eurUsdDataFeed,
        uint256 _minAmountToDepositInEuro,
        address _usdReceiver
    ) external initializer {
        require(_eurUsdDataFeed != address(0), "zero address");

        __ManageableVault_init(_ac, _mTBILL, _usdReceiver);
        minAmountToDepositInEuro = _minAmountToDepositInEuro;
        eurUsdDataFeed = IDataFeed(_eurUsdDataFeed);
    }

    /**
     * @inheritdoc IDepositVault
     * @dev transfers `tokenIn` from `msg.sender`
     * to `tokensReceiver`
     * @param tokenIn address of token to deposit.
     * @param amountUsdIn amount of token to deposit in 10**18 decimals.
     */
    function deposit(address tokenIn, uint256 amountUsdIn)
        external
        onlyGreenlisted(msg.sender)
        whenNotPaused
    {
        address user = msg.sender;

        _requireTokenExists(tokenIn);

        lastRequestId.increment();
        uint256 requestId = lastRequestId.current();

        if (!isFreeFromMinDeposit[user]) {
            _validateAmountUsdIn(user, amountUsdIn);
        }
        require(amountUsdIn > 0, "DV: invalid amount");

        totalDeposited[user] += amountUsdIn;
        _tokenTransferFromUser(tokenIn, amountUsdIn);

        emit Deposit(requestId, user, tokenIn, amountUsdIn);
    }

    /**
     * @inheritdoc IDepositVault
     */
    function freeFromMinDeposit(address user) external onlyVaultAdmin {
        require(!isFreeFromMinDeposit[user], "DV: already free");

        isFreeFromMinDeposit[user] = true;

        emit FreeFromMinDeposit(user);
    }

    /**
     * @inheritdoc IDepositVault
     */
    function setMinAmountToDeposit(uint256 newValue) external onlyVaultAdmin {
        minAmountToDepositInEuro = newValue;

        emit SetMinAmountToDeposit(msg.sender, newValue);
    }

    /**
     * @notice minAmountToDepositInEuro converted to USD in base18
     */
    function minAmountToDepositInUsd() public view returns (uint256) {
        return
            (minAmountToDepositInEuro * eurUsdDataFeed.getDataInBase18()) /
            10**18;
    }

    /**
     * @inheritdoc ManageableVault
     */
    function vaultRole() public pure override returns (bytes32) {
        return DEPOSIT_VAULT_ADMIN_ROLE;
    }

    /**
     * @dev validates that inputted USD amount >= minAmountToDepositInUsd()
     * @param user user address
     * @param amountUsdIn amount of USD
     */
    function _validateAmountUsdIn(address user, uint256 amountUsdIn)
        internal
        view
    {
        if (totalDeposited[user] != 0) return;
        require(
            amountUsdIn >= minAmountToDepositInUsd(),
            "DV: usd amount < min"
        );
    }
}
