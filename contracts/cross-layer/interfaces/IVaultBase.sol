// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity ^0.6.8;

interface IVaultBase {

    function paused() external view returns (bool);

    function getRemoteTokenAddress(uint256 networkID, address tokenAddress) external view returns (address);

    function getCurrentTokenLiquidity(address tokenAddress) external view returns (uint256);

    function calculateFeePercentage(address tokenAddress, uint256 amount) external view returns (uint256);

    function depositERC20(
        uint256 amount,
        address tokenAddress,
        address destinationAddress,
        uint256 remoteNetworkID,
        uint256 transferDelay
    ) external;

    function withdrawTo(
        address accountTo,
        uint256 amount,
        address tokenAddress,
        uint256 remoteNetworkID,
        bytes32 id
    )
    external;
}