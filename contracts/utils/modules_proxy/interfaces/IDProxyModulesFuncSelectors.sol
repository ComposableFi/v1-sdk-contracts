// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.6.8;

/******************************************************************************\
* Author: denis-abag <denis@ composable.finance>
* Implementation based on EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/

// IDProxyModulesFuncSelectors is an interface to get modules functions selectors registered in ProxyModules.

interface IDProxyModulesFuncSelectors {
	/// These functions are expected to be called frequently
	/// by tools.

	struct ModuleFuncSelectors {
		address moduleAddress;
		bytes4[] functionSelectors;
	}

	/// @notice Gets all modules addresses and their four byte function selectors.
	/// @return _moduleFuncSelectors ModuleFuncSelectors[]
	function getAllModulesFuncSelectors() external view returns (ModuleFuncSelectors[] memory _moduleFuncSelectors);

	/// @notice Gets all the function selectors supported by a specific module.
	/// @param _moduleAddress The module address.
	/// @return moduleFuncSelectors_ array
	function getModuleFuncSelectors(address _moduleAddress) external view returns (bytes4[] memory moduleFuncSelectors_);

	/// @notice Get all the modules addresses used by a modules hub.
	/// @return _modulesAddresses
	function getAllModulesAddresses() external view returns (address[] memory _modulesAddresses);

	/// @notice Gets the module that supports the given selector.
	/// @dev If module is not found return address(0).
	/// @param _functionSelector The function selector.
	/// @return moduleAddress_ The module address.
	function moduleAddress(bytes4 _functionSelector) external view returns (address moduleAddress_);
}
