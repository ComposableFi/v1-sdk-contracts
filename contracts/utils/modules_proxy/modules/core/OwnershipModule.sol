// SPDX-License-Identifier: MIT
pragma solidity >=0.6.8;

import { LibDProxyModules } from "../../libraries/LibDProxyModules.sol";
import { IERC173 } from "../../interfaces/IERC173.sol";

contract OwnershipModule is IERC173 {
	function transferOwnership(address _newOwner) external override {
		LibDProxyModules.enforceIsContractOwner();
		LibDProxyModules.setContractOwner(_newOwner);
	}

	function setContractAdmin(address _newAdmin) external {
		LibDProxyModules.setContractAdmin(_newAdmin);
	}

	function removeContractAdmin(address _newAdmin) external {
		LibDProxyModules.removeContractAdmin(_newAdmin);
	}

	function isContractAdmin(address _address) external view returns (bool _isAdmin) {
		_isAdmin = LibDProxyModules.isContractAdmin(_address);
	}

	function isContractOwnerOrAdmin(address _address) external view returns (bool _isOwnerOrAdmin) {
		_isOwnerOrAdmin = LibDProxyModules.isContractOwnerOrAdmin(_address);
	}

	function owner() external view override returns (address owner_) {
		owner_ = LibDProxyModules.contractOwner();
	}
}
