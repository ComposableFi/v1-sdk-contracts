// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.6.8;
import { EnumerableUint256Set } from "../../libraries/EnumerableUint256Set.sol";

/// @title Networks module contract
/// @author denis-abag <denis@composable.finance>
/// @notice Stores and returns all networks configs
/// @dev This module should be registered in Config Proxy contract
/// @dev The storage need to be implemented as Struct with assembly unique .slot assignment
interface INetworksConfigModule {
	struct NetworkConfig {
		uint256 networkId; // 421611
		uint256 timeout; // 120000
		uint256 gasPrice; // 20000000
		uint256 gas; // 10000000
		bytes32 networkName; // rinkeby
		address vaultAddress; // the network vault proxy address
		string url; // "https://rinkeby.arbitrum.io/rpc"
	}

	struct State {
		mapping(uint256 => NetworkConfig) networkConfigs; //networkId => NetworkConfig
		mapping(bytes32 => uint256) networkNameToId; //networkName => networkId
		EnumerableUint256Set.Uint256Set networkIds;
	}

	function getNetworkConfigById(uint256 _networkId) external view returns (NetworkConfig memory);

	function getNetworkConfigByName(bytes32 _networkName) external view returns (NetworkConfig memory);

	function addNetworkConfig(NetworkConfig calldata _configToAdd) external;

	/// @notice hint: use updateNetworkConfig to skip config existence check
	function updateNetworkConfig(NetworkConfig calldata _configToAdd) external;

	function getNetworkIds() external view returns (uint256[] memory);

	function removeNetworkConfig(uint256 _ntwId) external;

	function getVaultAddressByNetworkId(uint256 _networkId) external view returns (address);

	function getVaultAddressByNetworkName(bytes32 _name) external view returns (address);
}
