pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./ConfigGetter.sol";
import "../interfaces/IComposableExchange.sol";
import "../../utils/protocol_config/interfaces/IExchangesConfigModule.sol";

library Swap {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    function getAmountsOut(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        bytes memory _data
    ) internal view returns (uint256) {
        IComposableExchange exchangeAdapter = getExchangeAdapter();
        return _getAmountsOut(exchangeAdapter, _tokenIn, _tokenOut, _amountIn, _data);
    }

    function getAmountsOut(
        bytes32 _exchangeId,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        bytes memory _data
    ) internal view returns (uint256) {
        IComposableExchange exchangeAdapter = getExchangeAdapter(_exchangeId);
        return _getAmountsOut(exchangeAdapter, _tokenIn, _tokenOut, _amountIn, _data);
    }

    function _getAmountsOut(
        IComposableExchange _exchangeAdapter,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        bytes memory _data
    ) private view returns (uint256) {
        return _exchangeAdapter.getAmountsOut(_tokenIn, _tokenOut, _amountIn, _data);
    }

    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOut,
        address to,
        bytes memory _data
    ) internal returns (uint256) {
        IComposableExchange exchangeAdapter = getExchangeAdapter();
        return _swap(exchangeAdapter, _tokenIn, _tokenOut, _amountIn, _amountOut, to, _data);
    }

    function swap(
        bytes32 _exchangeId,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOut,
        address to,
        bytes memory _data
    ) internal returns (uint256) {
        IComposableExchange exchangeAdapter = getExchangeAdapter(_exchangeId);
        return _swap(exchangeAdapter, _tokenIn, _tokenOut, _amountIn, _amountOut, to, _data);
    }

    function _swap(
        IComposableExchange _exchangeAdapter,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOut,
        address to,
        bytes memory _data
    ) private returns (uint256) {
        uint256 tokenInAllowance = IERC20(_tokenIn).allowance(address(this), address(_exchangeAdapter));
        if(tokenInAllowance < _amountIn){
            IERC20(_tokenIn).safeIncreaseAllowance(address(_exchangeAdapter), _amountIn.sub(tokenInAllowance));
        }

        uint256 amountSwapped = _exchangeAdapter.swap(_tokenIn, _tokenOut, _amountIn, _amountOut, _data);
        IERC20(_tokenOut).safeTransfer(to, amountSwapped);
        return amountSwapped;
    }

    function getConfigAddress() internal pure returns (address) {
        return ConfigGetter.getConfigAddress();
    }

    function getAvailableExchanges() internal view returns (bytes32[] memory) {
        IExchangesConfigModule exchangesConfig = getExchangeConfig();
        uint256 chainId = ConfigGetter.getChainId();
        return exchangesConfig.getNetworkExchanges(chainId);
    }

    function getExchangeAdapter(bytes32 _exchangeId) private view returns (IComposableExchange) {
        IExchangesConfigModule exchangesConfig = getExchangeConfig();
        uint256 chainId = ConfigGetter.getChainId();
        address exchangeAdapterAddress =  exchangesConfig.getNetworkExchangeAdapterAddress(chainId, _exchangeId);
        require(exchangeAdapterAddress != address(0), "Exchange adapter not deployed in this network");
        return IComposableExchange(exchangeAdapterAddress);
    }

    function getExchangeAdapter() private view returns (IComposableExchange) {
        IExchangesConfigModule exchangesConfig = getExchangeConfig();
        uint256 chainId = ConfigGetter.getChainId();
        bytes32[] memory availableExchanges = exchangesConfig.getNetworkExchanges(chainId);
        require(availableExchanges.length > 0, "No exchange adapters deployed in this network");
        address exchangeAdapterAddress =  exchangesConfig.getNetworkExchangeAdapterAddress(chainId, availableExchanges[0]);
        return IComposableExchange(exchangeAdapterAddress);
    }

    function getExchangeConfig() private pure returns (IExchangesConfigModule) {
        address configAddress = getConfigAddress();
        require(configAddress != address(0), "Config module not deployed in this network");
        return(IExchangesConfigModule(configAddress));
    }

    function getChainId() internal pure returns (uint256) {
        return ConfigGetter.getChainId();
    }

}
