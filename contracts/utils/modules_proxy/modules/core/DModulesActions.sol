// SPDX-License-Identifier: MIT
//pragma solidity >=0.6.8;
pragma experimental ABIEncoderV2;
pragma solidity >=0.6.8;

/******************************************************************************\
* Author: denis-abag <denis@composable.finance>
* Implementation based on EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/

import { IDModulesActions } from "../../interfaces/IDModulesActions.sol";
import { LibDProxyModules } from "../../libraries/LibDProxyModules.sol";

contract DModulesActions is IDModulesActions {
	/// @notice Add/replace/remove any number of functions and optionally execute
	///         a function with delegatecall
	/// @param _modulesActions Contains the modules addresses, function selectors and action to perform (add, replace, remove)
	/// @param _init The address of the contract or facet to execute _calldata
	/// @param _calldata A function call, including function selector and arguments
	///                  _calldata is executed with delegatecall on _init
	function runModuleFuncSelectorsAction(
		ModuleFuncSelectorsAction[] calldata _modulesActions,
		address _init,
		bytes calldata _calldata
	) external override {
		LibDProxyModules.enforceIsContractOwner();
		LibDProxyModules.runModuleFuncSelectorsAction(_modulesActions, _init, _calldata);
	}
}
