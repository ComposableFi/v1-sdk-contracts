// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.6.8;
import { EnumerableBytes32Set } from "../../libraries/EnumerableBytes32Set.sol";

/// @title Exchanges module contract
/// @author denis-abag <denis@composable.finance>
/// @notice Stores and returns all exchanges configs
/// @dev This module should be registered in Config Proxy contract
/// @dev The storage need to be implemented as Struct with assembly unique .slot assignment
interface IExchangesConfigModule {
	struct Exchanges {
		mapping(bytes32 => address) exchangeAdapterAddress;
		EnumerableBytes32Set.Bytes32Set exchangesList;
	}
	struct State {
		mapping(uint256 => Exchanges) networkExchanges; //networkId => Exchanges
	}

	function setExchangeAdapterAddress(
		uint256 _networkId,
		bytes32 _exchangeId,
		address _adapterAddress
	) external;

	function getNetworkExchangeAdapterAddress(uint256 _networkId, bytes32 _exchangeId) external view returns (address);

	function getNetworkExchanges(uint256 networkId) external view returns (bytes32[] memory);

	function removeNetworkExchangeAdapter(uint256 _networkId, bytes32 _exchangeId) external;
}
