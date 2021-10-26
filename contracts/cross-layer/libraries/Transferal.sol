pragma solidity ^0.6.8;

import "./ConfigGetter.sol";
import "../interfaces/IVaultBase.sol";
import "../../utils/protocol_config/interfaces/INetworksConfigModule.sol";

library Transferal {
    modifier isValidTokenAddress(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token address");
        _;
    }

    function isPaused() internal view
    returns (bool){
        IVaultBase vaultBase = getVault();
        return vaultBase.paused();
    }

    function isTokenSupported(address tokenAddress, uint256 networkId) internal view
    isValidTokenAddress(tokenAddress)
    returns (bool){
        IVaultBase vaultBase = getVault();
        return vaultBase.getRemoteTokenAddress(networkId, tokenAddress) != address(0);
    }

    function getVaultTokenBalance(address tokenAddress) internal view
    isValidTokenAddress(tokenAddress)
    returns (uint256){
        IVaultBase vaultBase = getVault();
        return vaultBase.getCurrentTokenLiquidity(tokenAddress);
    }

    function calculateFeePercentage(address tokenAddress, uint256 amount) internal view
    isValidTokenAddress(tokenAddress)
    returns (uint256){
        IVaultBase vaultBase = getVault();
        return vaultBase.calculateFeePercentage(tokenAddress, amount);
    }

    function depositToken(
        uint256 amount,
        address tokenAddress,
        address destinationAddress,
        uint256 remoteNetworkID,
        uint256 transferDelay) internal
    isValidTokenAddress(tokenAddress) {
        IVaultBase vaultBase = getVault();
        require(vaultBase.paused() == false, "Cannot deposit to a paused Vault");
        vaultBase.depositERC20(amount, tokenAddress, destinationAddress,remoteNetworkID, transferDelay);
    }

    function getVault() private view returns(IVaultBase) {
        address vaultAddress = getVaultAddress();
        require(vaultAddress != address(0), "Vault not found in this network");
        return IVaultBase(vaultAddress);
    }

    function getVaultAddress() internal view returns (address) {
        INetworksConfigModule networkConfig = getNetworkConfig();
        return networkConfig.getVaultAddressByNetworkId(getChainId());
    }

    function getConfigAddress() internal pure returns (address) {
        return ConfigGetter.getConfigAddress();
    }

    function getNetworkConfig() private pure returns (INetworksConfigModule) {
        address configAddress = getConfigAddress();
        require(configAddress != address(0), "Config module not deployed in this network");
        return(INetworksConfigModule(configAddress));
    }

    function getChainId() internal pure returns (uint256) {
        return ConfigGetter.getChainId();
    }
}
