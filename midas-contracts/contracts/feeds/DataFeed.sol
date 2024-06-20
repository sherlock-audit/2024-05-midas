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
    uint256 public healthyDiff;

    /**
     * @dev minimal answer expected to receive from the `aggregator`
     */
    int256 public minExpectedAnswer;

    /**
     * @dev maximal answer expected to receive from the `aggregator`
     */
    int256 public maxExpectedAnswer;

    /**
     * @dev leaving a storage gap for futures updates
     */
    uint256[50] private __gap;

    /**
     * @inheritdoc IDataFeed
     */
    function initialize(
        address _ac,
        address _aggregator,
        uint256 _healthyDiff,
        int256 _minExpectedAnswer,
        int256 _maxExpectedAnswer
    ) external initializer {
        require(_aggregator != address(0), "DF: invalid address");
        require(_healthyDiff > 0, "DF: invalid diff");
        require(_minExpectedAnswer > 0, "DF: invalid min exp. price");
        require(_maxExpectedAnswer > 0, "DF: invalid max exp. price");
        require(
            _maxExpectedAnswer > _minExpectedAnswer,
            "DF: invalid exp. prices"
        );

        __WithMidasAccessControl_init(_ac);
        aggregator = AggregatorV3Interface(_aggregator);

        healthyDiff = _healthyDiff;
        minExpectedAnswer = _minExpectedAnswer;
        maxExpectedAnswer = _maxExpectedAnswer;
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
            block.timestamp - updatedAt <= healthyDiff &&
                _answer >= minExpectedAnswer &&
                _answer <= maxExpectedAnswer,
            "DF: feed is unhealthy"
        );
        roundId = _roundId;
        answer = uint256(_answer).convertToBase18(decimals);
    }
}
