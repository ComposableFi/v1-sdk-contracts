// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity ^0.6.8;

interface IAddressProvider {

    // Fetch the address associated with `_id`
    function get_address(
        uint256 _id
    ) external view returns (address contractAddress);

}
