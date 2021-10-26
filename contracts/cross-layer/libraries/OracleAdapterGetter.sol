pragma solidity ^0.6.8;

/// @title An oracle library to fetch token prices
/// @author Mayowa Tudonu
/// @notice This library holds oracle adapter address for different networks
library OracleAdapterGetter {
	address private constant ethereumMainnetOracleAdapter = address(0xCE43D1DddDB80C4189672d91eDD8c023F89a7B24);
	address private constant ethereumRopstenOracleAdapter = 0xc9F0603f008Fc537Eb45009d1592ed3B64eCd093;
	address private constant polygonMumbaiOracleAdapter = 0x4a99B5427fEA6bD4343E8Cee69bA77F6B19EfC54;
	address private constant polygonMainnetOracleAdapter = address(0xae5f4C97842596Ccaf29F2839037022678Bbb6eA);
	address private constant arbitrumRinkebyOracleAdapter = 0xFbCE4AAcC4b9bDCda01177eC9F358c6267ca3aDe;
	address private constant arbitrumMainnetOracleAdapter = address(0xae5f4C97842596Ccaf29F2839037022678Bbb6eA);

	/// @notice Return oracle adapter address per network
	/// @dev This function defaults to the ethereum mainnet adapter if chain id is not supported
	/// @return oracle adapter address
	function getOracleAdapter() internal pure returns (address) {
		uint256 chainId = getChainId();

		if (chainId == 3) {
			return ethereumRopstenOracleAdapter;
		}
		if (chainId == 137) {
			return polygonMainnetOracleAdapter;
		}
		if (chainId == 80001) {
			return polygonMumbaiOracleAdapter;
		}
		if (chainId == 42161) {
			return arbitrumMainnetOracleAdapter;
		}
		if (chainId == 421611) {
			return arbitrumRinkebyOracleAdapter;
		}

		return ethereumMainnetOracleAdapter;
	}

	/// @notice Return network chainId
	/// @dev This function uses the chainId opcode to fetch the network chainId
	/// @return chainId
	function getChainId() private pure returns (uint256 chainId) {
		assembly {
			chainId := chainid()
		}
	}
}
