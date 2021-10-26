pragma solidity ^0.6.8;
import "../utils/protocol_config/interfaces/IExchangesConfigModule.sol";

contract ExchangesConfigTester {
    constructor() public {}

    function getAvailableExchanges(address _configAddress) public view returns (bytes32[] memory) {
        IExchangesConfigModule exchangesConfig = IExchangesConfigModule(_configAddress);
        uint256 chainId = getChainId();
        bytes32[] memory result = exchangesConfig.getNetworkExchanges(chainId);
        return result;
    }

    function getFirstAvailableExchange(address _configAddress) public view returns (bytes32) {
        IExchangesConfigModule exchangesConfig = IExchangesConfigModule(_configAddress);
        uint256 chainId = getChainId();
        bytes32 result = exchangesConfig.getNetworkExchanges(chainId)[0];
        return result;
    }

    function getExchangeAddress(address _configAddress, bytes32 _exchangeId) public view returns (address) {
        IExchangesConfigModule exchangesConfig = IExchangesConfigModule(_configAddress);
        uint256 chainId = getChainId();
        return exchangesConfig.getNetworkExchangeAdapterAddress(chainId, _exchangeId);
    }

    function getChainId() public pure returns (uint256 chainId) {
        assembly {
            chainId := chainid()
        }
    }
}
