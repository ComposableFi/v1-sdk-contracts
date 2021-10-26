// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity >=0.6.8;

/******************************************************************************\
* Author: denis-abag <denis@composable.finance>
* Composable cross-layer protocol Settings implementation based on 
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of Settings contract (Diamond).
/******************************************************************************/

import { LibDProxyModules } from "./libraries/LibDProxyModules.sol";
import { IDModulesActions } from "./interfaces/IDModulesActions.sol";

/**
 * @notice This contract proxies all func calls to respective modules functions
 */
contract DProxyModules {
	//dev the Proxy (diamond in terms of EIP-2535) is initialized with a module
	constructor(address _contractOwner, address _moduleAddress) {
		LibDProxyModules.setContractOwner(_contractOwner);

		// Add the runModuleFuncSelectorsAction external function from the IDModulesActions
		IDModulesActions.ModuleFuncSelectorsAction[] memory moduleFuncSelectorsActions = new IDModulesActions.ModuleFuncSelectorsAction[](
			1
		);
		bytes4[] memory functionSelectors = new bytes4[](1);
		functionSelectors[0] = IDModulesActions.runModuleFuncSelectorsAction.selector;
		moduleFuncSelectorsActions[0] = IDModulesActions.ModuleFuncSelectorsAction({
			moduleAddress: _moduleAddress,
			action: IDModulesActions.ModuleAction.Add,
			functionSelectors: functionSelectors
		});
		LibDProxyModules.runModuleFuncSelectorsActionNoInit(moduleFuncSelectorsActions);
	}

	// Find module for function that is called and execute the
	// function if a module is found and return any value.
	fallback() external payable virtual {
		LibDProxyModules.ProxyModulesStorage storage ds;
		bytes32 position = LibDProxyModules.PROXY_MODULES_STORAGE_POSITION;
		// get diamond storage
		assembly {
			ds.slot := position
		}
		// get module address from function selector
		address moduleAddress = ds.moduleAddressAndSelectorPosition[msg.sig].moduleAddress;
		require(moduleAddress != address(0), "ProtocolSettings: Function does not exist");
		// Execute external function from module using delegatecall and return any value.
		assembly {
			// copy function selector and any arguments
			calldatacopy(0, 0, calldatasize())
			// execute function call using the facet
			let result := delegatecall(gas(), moduleAddress, 0, calldatasize(), 0, 0)
			// get any return value
			returndatacopy(0, 0, returndatasize())
			// return any return value or error back to the caller
			switch result
			case 0 {
				revert(0, returndatasize())
			}
			default {
				return(0, returndatasize())
			}
		}
	}

	receive() external payable virtual {}
}
