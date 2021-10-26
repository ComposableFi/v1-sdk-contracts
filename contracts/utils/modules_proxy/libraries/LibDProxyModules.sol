// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.6.8;

/******************************************************************************\
* Author: denis-abag <denis@composable.finance>
* Implementation based on EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/
import { IDModulesActions } from "../interfaces/IDModulesActions.sol";
import { EnumerableBytes32Set } from "../../libraries/EnumerableBytes32Set.sol";

library LibDProxyModules {
	bytes32 public constant PROXY_MODULES_STORAGE_POSITION = keccak256("proxy.modules.proxy.storage.position");
	using EnumerableBytes32Set for EnumerableBytes32Set.Bytes32Set;

	struct ModuleAddressAndSelectorPosition {
		address moduleAddress;
		uint16 selectorPosition;
	}

	struct ProxyModulesStorage {
		// function selector => module address and selector position in selectors array
		mapping(bytes4 => ModuleAddressAndSelectorPosition) moduleAddressAndSelectorPosition;
		bytes4[] selectors;
		mapping(bytes4 => bool) supportedInterfaces;
		// owner of the contract
		address contractOwner;
		EnumerableBytes32Set.Bytes32Set admins;
	}

	function proxyModulesStorage() internal pure returns (ProxyModulesStorage storage ds) {
		bytes32 position = PROXY_MODULES_STORAGE_POSITION;
		assembly {
			ds.slot := position
		}
	}

	event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

	function setContractOwner(address _newOwner) internal {
		ProxyModulesStorage storage ds = proxyModulesStorage();
		address previousOwner = ds.contractOwner;
		ds.contractOwner = _newOwner;
		emit OwnershipTransferred(previousOwner, _newOwner);
	}

	function contractOwner() internal view returns (address contractOwner_) {
		contractOwner_ = proxyModulesStorage().contractOwner;
	}

	function isContractAdmin(address _address) internal view returns (bool _isAdmin) {
		_isAdmin = proxyModulesStorage().admins.containsAddress(_address);
	}

	function setContractAdmin(address _address) internal {
		enforceIsContractOwner();
		proxyModulesStorage().admins.addAddress(_address);
	}

	function removeContractAdmin(address _address) internal {
		enforceIsContractOwner();
		proxyModulesStorage().admins.removeAddress(_address);
	}

	function getContractAdmins() internal view returns (bytes32[] memory _admins) {
		_admins = proxyModulesStorage().admins.enumerateAll();
	}

	function enforceIsContractOwner() internal view {
		require(msg.sender == proxyModulesStorage().contractOwner, "LibDProxyModules: Must be contract owner");
	}

	function enforceIsContractAdmin() internal view {
		require(isContractAdmin(msg.sender), "LibDProxyModules: Must be contract admin");
	}

	function isContractOwnerOrAdmin(address _address) internal view returns (bool _isOwnerOrAdmin) {
		_isOwnerOrAdmin = _address == proxyModulesStorage().contractOwner || isContractAdmin(_address);
	}

	function enforceIsContractOwnerOrAdmin() internal view {
		require(isContractOwnerOrAdmin(msg.sender), "LibDProxyModules: Must be contract owner or admin");
	}

	event RunModuleFuncSelectorsAction(IDModulesActions.ModuleFuncSelectorsAction[] _moduleActions, address _init, bytes _calldata);

	// Internal function version of runModuleFuncSelectorsActionNoInit
	function runModuleFuncSelectorsActionNoInit(IDModulesActions.ModuleFuncSelectorsAction[] memory _moduleActions) internal {
		runModuleFuncSelectorsAction(_moduleActions, address(0), "");
	}

	// Internal function version of runModuleFuncSelectorsAction
	function runModuleFuncSelectorsAction(
		IDModulesActions.ModuleFuncSelectorsAction[] memory _moduleActions,
		address _init,
		bytes memory _calldata
	) internal {
		for (uint256 moduleIndex; moduleIndex < _moduleActions.length; moduleIndex++) {
			IDModulesActions.ModuleAction action = _moduleActions[moduleIndex].action;
			if (action == IDModulesActions.ModuleAction.Add) {
				addFunctions(_moduleActions[moduleIndex].moduleAddress, _moduleActions[moduleIndex].functionSelectors);
			} else if (action == IDModulesActions.ModuleAction.Replace) {
				replaceFunctions(_moduleActions[moduleIndex].moduleAddress, _moduleActions[moduleIndex].functionSelectors);
			} else if (action == IDModulesActions.ModuleAction.Remove) {
				removeFunctions(_moduleActions[moduleIndex].moduleAddress, _moduleActions[moduleIndex].functionSelectors);
			} else {
				revert("LibDProxyModules: Incorrect ModuleAction");
			}
		}
		emit RunModuleFuncSelectorsAction(_moduleActions, _init, _calldata);
		postModuleActionsProcessing(_init, _calldata);
	}

	/// @notice Adds functions signatures
	/// @dev	Reverts if the functions being added are already registered
	/// @param _moduleAddress new module address
	/// @param _functionSelectors brand new functions selectors
	function addFunctions(address _moduleAddress, bytes4[] memory _functionSelectors) internal {
		require(_functionSelectors.length > 0, "LibDProxyModules::addFunctions: no functions to add|remove|delete");
		ProxyModulesStorage storage ds = proxyModulesStorage();
		uint16 selectorCount = uint16(ds.selectors.length);
		require(_moduleAddress != address(0), "LibDProxyModules::addFunctions: module can't be address(0)");
		enforceHasContractCode(_moduleAddress, "LibDProxyModules::addFunctions: module has no code");
		for (uint256 selectorIndex; selectorIndex < _functionSelectors.length; selectorIndex++) {
			bytes4 selector = _functionSelectors[selectorIndex];
			address oldModuleAddress = ds.moduleAddressAndSelectorPosition[selector].moduleAddress;
			require(oldModuleAddress == address(0), "LibDProxyModules: Can't add function that already exists");
			ds.moduleAddressAndSelectorPosition[selector] = ModuleAddressAndSelectorPosition(_moduleAddress, selectorCount);
			ds.selectors.push(selector);
			selectorCount++;
		}
	}

	/// @notice Replaces functions signatures
	/// @dev	Assigns new module to registered functions
	/// @param _moduleAddress new module address
	/// @param _functionSelectors all functions should be registered in another module and not in the modules proxy
	function replaceFunctions(address _moduleAddress, bytes4[] memory _functionSelectors) internal {
		require(_functionSelectors.length > 0, "LibDProxyModules::replaceFunctions: no functions to add|remove|delete");
		ProxyModulesStorage storage ds = proxyModulesStorage();
		require(_moduleAddress != address(0), "LibDProxyModules::replaceFunctions: module can't be address(0)");
		enforceHasContractCode(_moduleAddress, "LibDProxyModules::replaceFunctions: module has no code");
		for (uint256 selectorIndex; selectorIndex < _functionSelectors.length; selectorIndex++) {
			bytes4 selector = _functionSelectors[selectorIndex];
			address oldModuleAddress = ds.moduleAddressAndSelectorPosition[selector].moduleAddress;
			// can't replace immutable functions -- functions defined directly in the diamond
			require(oldModuleAddress != address(this), "LibDProxyModules: Can't replace immutable function");
			require(oldModuleAddress != _moduleAddress, "LibDProxyModules: Can't replace function with same function");
			require(oldModuleAddress != address(0), "LibDProxyModules: Can't replace function that doesn't exist");
			// replace old module address
			ds.moduleAddressAndSelectorPosition[selector].moduleAddress = _moduleAddress;
		}
	}

	/// @notice Removes registered functions signatures
	/// @param _moduleAddress module address to remove functions selectors from
	/// @param _functionSelectors functions selectors to remove
	function removeFunctions(address _moduleAddress, bytes4[] memory _functionSelectors) internal {
		require(_functionSelectors.length > 0, "LibDProxyModules::removeFunctions: No selectors in module to remove");
		ProxyModulesStorage storage ds = proxyModulesStorage();
		uint256 selectorCount = ds.selectors.length;
		require(_moduleAddress == address(0), "LibDProxyModules::replaceFunctions: module address must be address(0)");
		for (uint256 selectorIndex; selectorIndex < _functionSelectors.length; selectorIndex++) {
			bytes4 selector = _functionSelectors[selectorIndex];
			ModuleAddressAndSelectorPosition memory oldModuleAddressAndSelectorPosition = ds.moduleAddressAndSelectorPosition[selector];
			require(
				oldModuleAddressAndSelectorPosition.moduleAddress != address(0),
				"LibDProxyModules: Can't remove function that doesn't exist"
			);
			// can't remove immutable functions -- functions defined directly in the diamond
			require(
				oldModuleAddressAndSelectorPosition.moduleAddress != address(this),
				"LibDProxyModules: Can't remove immutable function."
			);
			// replace selector with last selector
			selectorCount--;
			if (oldModuleAddressAndSelectorPosition.selectorPosition != selectorCount) {
				bytes4 lastSelector = ds.selectors[selectorCount];
				ds.selectors[oldModuleAddressAndSelectorPosition.selectorPosition] = lastSelector;
				ds.moduleAddressAndSelectorPosition[lastSelector].selectorPosition = oldModuleAddressAndSelectorPosition.selectorPosition;
			}
			// delete last selector
			ds.selectors.pop();
			delete ds.moduleAddressAndSelectorPosition[selector];
		}
	}

	/// @notice Processing performed after every proxy module action - add|replace|remove
	/// @param _init address of the contract to execute call post processing
	/// @param _calldata a parameter just like in doxygen (must be followed by parameter name)
	function postModuleActionsProcessing(address _init, bytes memory _calldata) internal {
		if (_init == address(0)) {
			require(_calldata.length == 0, "LibDProxyModules: _init is address(0) but_calldata is not empty");
		} else {
			require(_calldata.length > 0, "LibDProxyModules: _calldata is empty but _init is not address(0)");
			if (_init != address(this)) {
				enforceHasContractCode(_init, "LibDProxyModules: _init address has no code");
			}
			(bool success, bytes memory error) = _init.delegatecall(_calldata);
			if (!success) {
				if (error.length > 0) {
					// bubble up the error
					revert(string(error));
				} else {
					revert("LibDProxyModules: _init function reverted");
				}
			}
		}
	}

	function enforceHasContractCode(address _contract, string memory _errorMessage) internal view {
		uint256 contractSize;
		assembly {
			contractSize := extcodesize(_contract)
		}
		require(contractSize > 0, _errorMessage);
	}
}
