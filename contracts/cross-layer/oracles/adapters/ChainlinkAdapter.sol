pragma solidity ^0.6.8;
import "../../interfaces/IERC20.sol";
import "../../interfaces/IOracle.sol";
import "../../interfaces/IChainlinkV3Aggregator.sol";
import "../../../utils/Ownable.sol";

/// @title Oracle Interface
/// @author Mayowa Tudonu <mayowa@composable.finance>
/// @notice You can fetch token prices from chainlink with this contract
/// @dev All prices are fetch from chainlink price feed aggregators
contract ChainlinkAdapter is IOracle, Ownable {
	/// @notice maps token address to price feed aggregator
	mapping(address => address) public tokenToAggregator;

	/// @notice emits this event when a new price aggregator is added for a token
	event AddedTokenPriceAggregator(address _tokenAddress, address _aggregator);

	/// @notice Add a chainlink data feed aggregator for a token
	/// @param _tokenAddress The address of the token to add
	/// @param _tokenAddress The address of the data feed aggregator for the token
	function addTokenPriceAggregator(address _tokenAddress, address _aggregator) external onlyOwner {
		require(address(_tokenAddress) != address(0), "INVALID_TOKEN_ADDRESS");
		require(address(_aggregator) != address(0), "INVALID_AGGREGATOR_ADDRESS");
		tokenToAggregator[_tokenAddress] = _aggregator;
		emit AddedTokenPriceAggregator(_tokenAddress, _aggregator);
	}

	function getTokenPrice(address _tokenAddress) external view override returns (uint256) {
		require(address(_tokenAddress) != address(0), "INVALID_TOKEN_ADDRESS");
		address _aggregator = tokenToAggregator[_tokenAddress];
		require(address(_aggregator) != address(0), "UNSUPPORTED_TOKEN_ADDRESS");
		IChainlinkV3Aggregator priceFeed = IChainlinkV3Aggregator(_aggregator);
		(, int256 price, , , ) = priceFeed.latestRoundData();
		return uint256(price);
	}
}
