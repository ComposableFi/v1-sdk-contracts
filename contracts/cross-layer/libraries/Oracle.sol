pragma solidity ^0.6.8;
import "./OracleAdapterGetter.sol";
import "../interfaces/IOracle.sol";

/// @title An oracle library to fetch token prices
/// @author Mayowa Tudonu
/// @notice This library only returns token prices for tokens supported in Composable vaults
library Oracle {
	/// @notice Return token price from oracle adapter
	/// @dev This function relies on the adapter address to get token price
	/// @param tokenAddress The address of the token to fetch price for
	/// @return token price
	function getTokenPrice(address tokenAddress) internal view returns (uint256) {
		address oracleAdapter = OracleAdapterGetter.getOracleAdapter();
		return IOracle(oracleAdapter).getTokenPrice(tokenAddress);
	}
}
