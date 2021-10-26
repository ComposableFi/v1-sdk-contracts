// SPDX-License-Identifier: MIT
pragma solidity >=0.6.8;
pragma experimental ABIEncoderV2;
/******************************************************************************\
* Author: denis-abag <denis@composable.finance>
* Implementation based on EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/

import { LibDProxyModules } from "../../libraries/LibDProxyModules.sol";
import { IDProxyModulesFuncSelectors } from "../../interfaces/IDProxyModulesFuncSelectors.sol";
import { IERC165 } from "../../interfaces/IERC165.sol";

contract DProxyModulesFuncSelectors is IDProxyModulesFuncSelectors, IERC165 {
	// Proxy Modules Functions
	////////////////////////////////////////////////////////////////////
	/// These functions are expected to be called frequently by tools.
	//
	// struct ModuleFuncSelectors {
	// 		address moduleAddress;
	// 		bytes4[] functionSelectors;
	// 	}
	/// @notice Gets all modules and their functions selectors.
	/// @return modules_ ModuleFuncSelectors[]
	function getAllModulesFuncSelectors() external view override returns (ModuleFuncSelectors[] memory modules_) {
		LibDProxyModules.ProxyModulesStorage storage ds = LibDProxyModules.proxyModulesStorage();
		uint256 selectorCount = ds.selectors.length;
		// create an array set to the maximum size possible
		modules_ = new ModuleFuncSelectors[](selectorCount);
		// create an array for counting the number of selectors for each module
		uint8[] memory numModulesSelectors = new uint8[](selectorCount);
		// total number of modules
		uint256 numModules;
		// loop through function selectors
		for (uint256 selectorIndex; selectorIndex < selectorCount; selectorIndex++) {
			bytes4 selector = ds.selectors[selectorIndex];
			address moduleAddress_ = ds.moduleAddressAndSelectorPosition[selector].moduleAddress;
			bool continueLoop = false;
			// find the functionSelectors array for selector and add selector to it
			for (uint256 moduleIndex; moduleIndex < numModules; moduleIndex++) {
				if (modules_[moduleIndex].moduleAddress == moduleAddress_) {
					modules_[moduleIndex].functionSelectors[numModulesSelectors[moduleIndex]] = selector;
					// probably will never have more than 256 functions from one module contract
					require(numModulesSelectors[moduleIndex] < 255);
					numModulesSelectors[moduleIndex]++;
					continueLoop = true;
					break;
				}
			}
			// if functionSelectors array exists for selector then continue loop
			if (continueLoop) {
				continueLoop = false;
				continue;
			}
			// create a new functionSelectors array for selector
			modules_[numModules].moduleAddress = moduleAddress_;
			modules_[numModules].functionSelectors = new bytes4[](selectorCount);
			modules_[numModules].functionSelectors[0] = selector;
			numModulesSelectors[numModules] = 1;
			numModules++;
		}
		for (uint256 moduleIndex; moduleIndex < numModules; moduleIndex++) {
			uint256 numSelectors = numModulesSelectors[moduleIndex];
			bytes4[] memory selectors = modules_[moduleIndex].functionSelectors;
			// setting the number of selectors
			assembly {
				mstore(selectors, numSelectors)
			}
		}
		// setting the number of modules
		assembly {
			mstore(modules_, numModules)
		}
	}

	/// @notice Gets all the function selectors supported by a specific module.
	/// @param _module The module address.
	/// @return _moduleFunctionSelectors The selectors associated with a module address.
	function getModuleFuncSelectors(address _module) external view override returns (bytes4[] memory _moduleFunctionSelectors) {
		LibDProxyModules.ProxyModulesStorage storage ds = LibDProxyModules.proxyModulesStorage();
		uint256 selectorCount = ds.selectors.length;
		uint256 numSelectors;
		_moduleFunctionSelectors = new bytes4[](selectorCount);
		// loop through function selectors
		for (uint256 selectorIndex; selectorIndex < selectorCount; selectorIndex++) {
			bytes4 selector = ds.selectors[selectorIndex];
			address moduleAddress_ = ds.moduleAddressAndSelectorPosition[selector].moduleAddress;
			if (_module == moduleAddress_) {
				_moduleFunctionSelectors[numSelectors] = selector;
				numSelectors++;
			}
		}
		// Set the number of selectors in the array
		assembly {
			mstore(_moduleFunctionSelectors, numSelectors)
		}
	}

	/// @notice Get all the module addresses used by a modules hub.
	/// @return moduleAddresses_
	function getAllModulesAddresses() external view override returns (address[] memory moduleAddresses_) {
		LibDProxyModules.ProxyModulesStorage storage ds = LibDProxyModules.proxyModulesStorage();
		uint256 selectorCount = ds.selectors.length;
		// create an array set to the maximum size possible
		moduleAddresses_ = new address[](selectorCount);
		uint256 numModules;
		// loop through function selectors
		for (uint256 selectorIndex; selectorIndex < selectorCount; selectorIndex++) {
			bytes4 selector = ds.selectors[selectorIndex];
			address moduleAddress_ = ds.moduleAddressAndSelectorPosition[selector].moduleAddress;
			bool continueLoop = false;
			// see if we have collected the address already and break out of loop if we have
			for (uint256 moduleIndex; moduleIndex < numModules; moduleIndex++) {
				if (moduleAddress_ == moduleAddresses_[moduleIndex]) {
					continueLoop = true;
					break;
				}
			}
			// continue loop if we already have the address
			if (continueLoop) {
				continueLoop = false;
				continue;
			}
			// include address
			moduleAddresses_[numModules] = moduleAddress_;
			numModules++;
		}
		// Set the number of module addresses in the array
		assembly {
			mstore(moduleAddresses_, numModules)
		}
	}

	/// @notice Gets the module address that supports the given selector.
	/// @dev If module is not found return address(0).
	/// @param _functionSelector The function selector.
	/// @return moduleAddress_ The module address.
	function moduleAddress(bytes4 _functionSelector) external view override returns (address moduleAddress_) {
		LibDProxyModules.ProxyModulesStorage storage ds = LibDProxyModules.proxyModulesStorage();
		moduleAddress_ = ds.moduleAddressAndSelectorPosition[_functionSelector].moduleAddress;
	}

	// This implements ERC-165.
	function supportsInterface(bytes4 _interfaceId) external view override returns (bool) {
		LibDProxyModules.ProxyModulesStorage storage ds = LibDProxyModules.proxyModulesStorage();
		return ds.supportedInterfaces[_interfaceId];
	}
}
