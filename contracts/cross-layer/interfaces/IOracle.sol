pragma solidity ^0.6.8;

/// @title Oracle Interface
/// @author Mayowa Tudonu <mayowa@composable.finance>
/// @notice Implement this Oracle interface to get token prices for all Oracles
interface IOracle {

    /// @notice returns token price in USD
    function getTokenPrice(address _tokenAddress) external view returns (uint256);
}
