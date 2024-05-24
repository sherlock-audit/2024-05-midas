// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "../access/WithMidasAccessControl.sol";
import "../libraries/DecimalsCorrectionLibrary.sol";
import "../interfaces/IDataFeed.sol";

/**
 * @title DataFeed
 * @notice Wrapper of ChainLink`s AggregatorV3 data feeds
 * @author RedDuck Software
 */
contract DataFeed is WithMidasAccessControl, IDataFeed {
    using DecimalsCorrectionLibrary for uint256;

    /**
     * @notice AggregatorV3Interface contract address
     */
    AggregatorV3Interface public aggregator;

    /**
     * @dev healty difference between `block.timestamp` and `updatedAt` timestamps
     */
    uint256 private constant _HEALTHY_DIFF = 3 days;

    /**
     * @inheritdoc IDataFeed
     */
    function initialize(address _ac, address _aggregator) external initializer {
        require(_aggregator != address(0), "DF: invalid address");

        __WithMidasAccessControl_init(_ac);
        aggregator = AggregatorV3Interface(_aggregator);
    }

    /**
     * @inheritdoc IDataFeed
     */
    function changeAggregator(address _aggregator)
        external
        onlyRole(DEFAULT_ADMIN_ROLE, msg.sender)
    {
        require(_aggregator != address(0), "DF: invalid address");

        aggregator = AggregatorV3Interface(_aggregator);
    }

    /**
     * @inheritdoc IDataFeed
     */
    function getDataInBase18() external view returns (uint256 answer) {
        (, answer) = _getDataInBase18();
    }

    /**
     * @dev fetches answer from aggregator
     * and converts it to the base18 precision
     * @return roundId fetched aggregator answer roundId
     * @return answer fetched aggregator answer
     */
    function _getDataInBase18()
        private
        view
        returns (uint80 roundId, uint256 answer)
    {
        uint8 decimals = aggregator.decimals();
        (uint80 _roundId, int256 _answer, , uint256 updatedAt, ) = aggregator
            .latestRoundData();
        require(_answer > 0, "DF: feed is deprecated");
        require(
            // solhint-disable-next-line not-rely-on-time
            block.timestamp - updatedAt <= _HEALTHY_DIFF,
            "DF: feed is unhealthy"
        );
        roundId = _roundId;
        answer = uint256(_answer).convertToBase18(decimals);
    }
}
