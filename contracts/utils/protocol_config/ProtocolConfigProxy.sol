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

import { LibDProxyModules } from "../modules_proxy/libraries/LibDProxyModules.sol";
import { IDModulesActions } from "../modules_proxy/interfaces/IDModulesActions.sol";
import { DProxyModules } from "../modules_proxy/DProxyModules.sol";

/**
 * @notice This contract proxies all func calls to respective modules functions
 */
contract ProtocolConfigProxy is DProxyModules {
	constructor(address _contractOwner, address _moduleAddress) DProxyModules(_contractOwner, _moduleAddress) {}

	receive() external payable override {
		revert("ProtocolSettings is nonpayable");
	}
}
