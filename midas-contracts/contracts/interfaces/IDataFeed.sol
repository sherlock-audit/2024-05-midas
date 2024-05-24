// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "../access/WithMidasAccessControl.sol";
import "../libraries/DecimalsCorrectionLibrary.sol";

/**
 * @title IDataFeed
 * @author RedDuck Software
 */
interface IDataFeed {
    /**
     * @notice upgradeable pattern contract`s initializer
     * @param _ac MidasAccessControl contract address
     * @param _aggregator AggregatorV3Interface contract address
     */
    function initialize(address _ac, address _aggregator) external;

    /**
     * @notice updates `aggregator` address
     * @param _aggregator new AggregatorV3Interface contract address
     */
    function changeAggregator(address _aggregator) external;

    /**
     * @notice fetches answer from aggregator
     * and converts it to the base18 precision
     * @return answer fetched aggregator answer
     */
    function getDataInBase18() external view returns (uint256 answer);
}
