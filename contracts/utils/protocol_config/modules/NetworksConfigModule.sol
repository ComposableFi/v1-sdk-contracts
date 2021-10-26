// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.6.8;
import { LibDProxyModules } from "../../modules_proxy/libraries/LibDProxyModules.sol";
import { EnumerableUint256Set } from "../../libraries/EnumerableUint256Set.sol";
import { INetworksConfigModule } from "../interfaces/INetworksConfigModule.sol";
import "hardhat/console.sol";

/// @title Networks module contract
/// @author denis-abag <denis@composable.finance>
/// @notice Stores and returns all networks configs
/// @dev This module should be registered in Config Proxy contract
/// @dev The storage need to be implemented as Struct with assembly unique .slot assignment
contract NetworksConfigModule is INetworksConfigModule {
	using EnumerableUint256Set for EnumerableUint256Set.Uint256Set;
	bytes32 public constant EMPTY_STRING = "";
	bytes32 public constant NETWORKS_CONFIG_STORAGE_POSITION = keccak256("proxy.modules.networks.config.storage.position");

	/*struct NetworkConfig {
		uint256 networkId; // 421611
		uint256 timeout; // 120000
		uint256 gasPrice; // 20000000
		uint256 gas; // 10000000
		string url; // "https://rinkeby.arbitrum.io/rpc"
		bytes32 networkName; // rinkeby
		address vaultAddress; // the network vault proxy address
	}

	struct State {
		mapping(uint256 => NetworkConfig) networkConfigs; //networkId => NetworkConfig
		mapping(bytes32 => uint256) networkNameToId; //networkName => networkId
		EnumerableUint256Set.Uint256Set networkIds;
	}*/

	function getVaultAddressByNetworkId(uint256 _networkId) external view override returns (address) {
		return this.getNetworkConfigById(_networkId).vaultAddress;
	}

	function getVaultAddressByNetworkName(bytes32 _networkName) external view override returns (address) {
		return this.getNetworkConfigByName(_networkName).vaultAddress;
	}

	function getNetworkConfigById(uint256 _networkId) external view override returns (NetworkConfig memory) {
		return getState().networkConfigs[_networkId];
	}

	function getNetworkConfigByName(bytes32 _networkName) external view override returns (NetworkConfig memory) {
		State storage state = getState();
		return state.networkConfigs[state.networkNameToId[_networkName]];
	}

	modifier networkConfigParamIsValid(NetworkConfig memory _configToValidate) {
		require(_configToValidate.networkId != 0, "Newtork id cannot be 0");
		require(_configToValidate.networkName != bytes32(EMPTY_STRING), "Network name cannot be empty");
		State storage state = getState();
		bytes32 stateNetworkName = state.networkConfigs[_configToValidate.networkId].networkName;
		require(
			state.networkNameToId[_configToValidate.networkName] == 0 ||
				state.networkNameToId[_configToValidate.networkName] == _configToValidate.networkId,
			"Network name is used for another network"
		);
		_;
	}

	function setNetworkConfig(NetworkConfig memory _configToSet) internal networkConfigParamIsValid(_configToSet) {
		State storage state = getState();
		bytes32 currentNetworkName = state.networkConfigs[_configToSet.networkId].networkName;
		if (currentNetworkName != bytes32(EMPTY_STRING) && currentNetworkName != _configToSet.networkName)
			delete state.networkNameToId[currentNetworkName];
		state.networkConfigs[_configToSet.networkId] = _configToSet;
		state.networkNameToId[_configToSet.networkName] = _configToSet.networkId;
		if (!state.networkIds.contains(_configToSet.networkId)) state.networkIds.addUint256(_configToSet.networkId);
	}

	function addNetworkConfig(NetworkConfig memory _configToAdd) external override {
		LibDProxyModules.enforceIsContractOwnerOrAdmin();
		require(getState().networkConfigs[_configToAdd.networkId].networkId == 0, "Use updateNetworkConfig to modify existing network");
		setNetworkConfig(_configToAdd);
	}

	/// @notice hint: use updateNetworkConfig to skip config existence check
	function updateNetworkConfig(NetworkConfig memory _configToUpdate) external override {
		LibDProxyModules.enforceIsContractOwnerOrAdmin();
		setNetworkConfig(_configToUpdate);
	}

	function getNetworkIds() external view override returns (uint256[] memory networkIds) {
		State storage state = getState();
		return state.networkIds.enumerate(0, state.networkIds.length());
	}

	function removeNetworkConfig(uint256 _networkId) external override {
		LibDProxyModules.enforceIsContractOwnerOrAdmin();
		State storage state = getState();
		delete state.networkNameToId[state.networkConfigs[_networkId].networkName];
		delete state.networkConfigs[_networkId];
		state.networkIds.removeUint256(_networkId);
	}

	//TODO: add removeNetworkExchangeByAMMAddress

	function getState() internal pure returns (State storage ds) {
		bytes32 position = NETWORKS_CONFIG_STORAGE_POSITION;
		assembly {
			ds.slot := position
		}
	}
}
