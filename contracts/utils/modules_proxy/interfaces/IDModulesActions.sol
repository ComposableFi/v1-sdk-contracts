// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.6.8;

/******************************************************************************\
* Author: denis-abag <denis@ composable.finance>
* Composable cross-layer protocol Settings implementation based on 
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/
//IDiamondCut
interface IDModulesActions {
	enum ModuleAction {
		Add,
		Replace,
		Remove
	}
	// Add=0, Replace=1, Remove=2 - functions signatures actions

	struct ModuleFuncSelectorsAction {
		address moduleAddress;
		ModuleAction action;
		bytes4[] functionSelectors;
	}

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
	) external;

	event RunModuleFuncSelectorsAction(ModuleFuncSelectorsAction[] _modulesRunActions, address _init, bytes _calldata);
}
