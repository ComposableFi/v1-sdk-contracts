// SPDX-License-Identifier: MIT
pragma solidity >=0.6.8;

/******************************************************************************\
* Author: denis-abag <denis@composable.finance>
* Implementation based on EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

import { LibDProxyModules } from "../libraries/LibDProxyModules.sol";
import { IDProxyModulesFuncSelectors } from "../interfaces/IDProxyModulesFuncSelectors.sol";
import { IDModulesActions } from "../interfaces/IDModulesActions.sol";
import { IExchangesConfigModule } from "../../protocol_config/interfaces/IExchangesConfigModule.sol";
import { INetworksConfigModule } from "../../protocol_config/interfaces/INetworksConfigModule.sol";
import { IERC173 } from "../interfaces/IERC173.sol";
import { IERC165 } from "../interfaces/IERC165.sol";

// It is exapected that this contract is customized if you want to deploy your ProxyModules (diamond in EIP-2535)
// with data from a deployment script. Use the init function to initialize state variables
// of your ProxyModules. Add parameters to the init funciton if you need to.

contract DProxyModulesInit {
	// You can add parameters to this function in order to pass in
	// data to set your own state variables
	function init() external {
		// adding ERC165 data
		LibDProxyModules.ProxyModulesStorage storage ds = LibDProxyModules.proxyModulesStorage();
		ds.supportedInterfaces[type(IERC165).interfaceId] = true;
		ds.supportedInterfaces[type(IDModulesActions).interfaceId] = true;
		ds.supportedInterfaces[type(IDProxyModulesFuncSelectors).interfaceId] = true;
		ds.supportedInterfaces[type(IExchangesConfigModule).interfaceId] = true;
		ds.supportedInterfaces[type(INetworksConfigModule).interfaceId] = true;
		ds.supportedInterfaces[type(IERC173).interfaceId] = true;

		// add your own state variables
		// EIP-2535 specifies that the `diamondCut` function (DModulesActions here) takes two optional
		// arguments: address _init and bytes calldata _calldata
		// These arguments are used to execute an arbitrary function using delegatecall
		// in order to set state variables in the diamond (DModulesProxy) during deployment or an upgrade
		// More info here: https://eips.ethereum.org/EIPS/eip-2535#diamond-interface
	}
}
