// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.6.8;
import { LibDProxyModules } from "../../modules_proxy/libraries/LibDProxyModules.sol";
import { IExchangesConfigModule } from "../interfaces/IExchangesConfigModule.sol";
import { EnumerableBytes32Set } from "../../libraries/EnumerableBytes32Set.sol";

/// @title Exchanges module contract
/// @author denis-abag <denis@composable.finance>
/// @notice Stores and returns all exchanges configs
/// @dev This module should be registered in Config Proxy contract
/// @dev The storage need to be implemented as Struct with assembly unique .slot assignment
contract ExchangesConfigModule is IExchangesConfigModule {
	using EnumerableBytes32Set for EnumerableBytes32Set.Bytes32Set;
	bytes32 constant EXCHANGES_CONFIG_STORAGE_POSITION = keccak256("proxy.modules.exchanges.config.storage.position");

	/*struct Exchanges {
		mapping(bytes32 => address) exchangeAdapterAddress;
		EnumerableBytes32Set.Bytes32Set exchangesList;
	}
	struct State {
		mapping(uint256 => Exchanges) networkExchanges; //networkId => Exchanges
	}
	}*/

	//TODO: add methods to get current network data

	function setExchangeAdapterAddress(
		uint256 _networkId,
		bytes32 _exchangeId,
		address _adapterAddress
	) external override {
		LibDProxyModules.enforceIsContractOwnerOrAdmin();
		uint256 chainId;
		assembly {
			chainId := chainid()
		}
		if (chainId == _networkId)
			LibDProxyModules.enforceHasContractCode(
				_adapterAddress,
				"Exchanges::setExchangeAdapterAddress: Exchange adapter address has no code"
			);
		State storage st = getState();
		st.networkExchanges[_networkId].exchangeAdapterAddress[_exchangeId] = _adapterAddress;
		st.networkExchanges[_networkId].exchangesList.addBytes32(_exchangeId);
	}

	function getNetworkExchangeAdapterAddress(uint256 _networkId, bytes32 _exchangeId) external view override returns (address) {
		return getState().networkExchanges[_networkId].exchangeAdapterAddress[_exchangeId];
	}

	function getNetworkExchanges(uint256 _networkId) external view override returns (bytes32[] memory) {
		State storage st = getState();
		//return st.networkExchanges[_networkId].exchangesList.enumerate(0, st.networkExchanges[_networkId].exchangesList.length());
		return st.networkExchanges[_networkId].exchangesList.enumerateAll();
	}

	function removeNetworkExchangeAdapter(uint256 _networkId, bytes32 _exchangeId) external override {
		LibDProxyModules.enforceIsContractOwnerOrAdmin();
		State storage st = getState();
		delete st.networkExchanges[_networkId].exchangeAdapterAddress[_exchangeId];
		st.networkExchanges[_networkId].exchangesList.removeBytes32(_exchangeId);
	}

	function getState() internal pure returns (State storage ds) {
		bytes32 position = EXCHANGES_CONFIG_STORAGE_POSITION;
		assembly {
			ds.slot := position
		}
	}
}
