pragma solidity ^0.6.8;
import "./ConfigGetter.sol";
import "../interfaces/IComposableExchange.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../../utils/protocol_config/interfaces/IExchangesConfigModule.sol";

library ExchangeLiquidity {
	using SafeERC20 for IERC20;
	using SafeMath for uint256;

	struct Util {
		uint256 allowance;
		address exchangeAdapter;
	}

	function removeLiquidityETH(
		address token,
		uint256 liquidity,
		uint256 amountTokenMin,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	) internal returns (uint256 amountToken, uint256 amountETH) {
		IComposableExchange _exchangeAdapter = getExchangeAdapter();
		return _removeLiquidityETH(_exchangeAdapter, token, liquidity, amountTokenMin, amountETHMin, to, deadline);
	}

	function removeLiquidityETH(
		bytes32 _exchangeId,
		address token,
		uint256 liquidity,
		uint256 amountTokenMin,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	) internal returns (uint256 amountToken, uint256 amountETH) {
		IComposableExchange _exchangeAdapter = getExchangeAdapter(_exchangeId);
		return _removeLiquidityETH(_exchangeAdapter, token, liquidity, amountTokenMin, amountETHMin, to, deadline);
	}

	function removeLiquidity(
		address tokenA,
		address tokenB,
		uint256 liquidity,
		uint256 amountAMin,
		uint256 amountBMin,
		address to,
		uint256 deadline
	) internal returns (uint256 amountA, uint256 amountB) {
		IComposableExchange _exchangeAdapter = getExchangeAdapter();
		return _removeLiquidity(_exchangeAdapter, tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
	}

	function removeLiquidity(
		bytes32 _exchangeId,
		address tokenA,
		address tokenB,
		uint256 liquidity,
		uint256 amountAMin,
		uint256 amountBMin,
		address to,
		uint256 deadline
	) internal returns (uint256 amountA, uint256 amountB) {
		IComposableExchange _exchangeAdapter = getExchangeAdapter(_exchangeId);
		return _removeLiquidity(_exchangeAdapter, tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
	}

	function _removeLiquidity(
		IComposableExchange _exchangeAdapter,
		address tokenA,
		address tokenB,
		uint256 liquidity,
		uint256 amountAMin,
		uint256 amountBMin,
		address to,
		uint256 deadline
	) private returns (uint256 amountA, uint256 amountB) {
		address pair = _exchangeAdapter.getPoolAddress(tokenA, tokenB);
		uint256 pairAllowance = IERC20(pair).allowance(address(this), address(_exchangeAdapter));
		if(pairAllowance < liquidity){
			IERC20(pair).safeIncreaseAllowance(address(_exchangeAdapter), liquidity.sub(pairAllowance));
		}

		return _exchangeAdapter.removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
	}

	function _removeLiquidityETH(
		IComposableExchange _exchangeAdapter,
		address token,
		uint256 liquidity,
		uint256 amountTokenMin,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	) private returns (uint256 amountToken, uint256 amountETH) {
		address pair = _exchangeAdapter.getPoolAddress(token, address(0x0)); //ETH is represented with zero address (0x0)
		uint256 pairAllowance = IERC20(pair).allowance(address(this), address(_exchangeAdapter));
		if(pairAllowance < liquidity){
			IERC20(pair).safeIncreaseAllowance(address(_exchangeAdapter), liquidity.sub(pairAllowance));
		}

		return _exchangeAdapter.removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline);
	}

	function addLiquidityETH(
		address token,
		uint256 amountTokenDesired,
		uint256 amountTokenMin,
		uint256 amountETHDesired,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	)
		internal
		returns (
			uint256 amountToken,
			uint256 amountETH,
			uint256 liquidity
		)
	{
		IComposableExchange _exchangeAdapter = getExchangeAdapter();
		return _addLiquidityETH(_exchangeAdapter, token, amountTokenDesired, amountTokenMin, amountETHDesired, amountETHMin, to, deadline);
	}

	function addLiquidityETH(
		bytes32 _exchangeId,
		address token,
		uint256 amountTokenDesired,
		uint256 amountTokenMin,
		uint256 amountETHDesired,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	)
		internal
		returns (
			uint256 amountToken,
			uint256 amountETH,
			uint256 liquidity
		)
	{
		IComposableExchange _exchangeAdapter = getExchangeAdapter(_exchangeId);
		return _addLiquidityETH(_exchangeAdapter, token, amountTokenDesired, amountTokenMin, amountETHDesired, amountETHMin, to, deadline);
	}

	function addLiquidity(
		address tokenA,
		address tokenB,
		uint256 amountADesired,
		uint256 amountBDesired,
		uint256 amountAMin,
		uint256 amountBMin,
		address to,
		uint256 deadline
	)
		internal
		returns (
			uint256 amountA,
			uint256 amountB,
			uint256 liquidity
		)
	{
		IComposableExchange _exchangeAdapter = getExchangeAdapter();
		return _addLiquidity(_exchangeAdapter, tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline);
	}

	function addLiquidity(
		bytes32 _exchangeId,
		address tokenA,
		address tokenB,
		uint256 amountADesired,
		uint256 amountBDesired,
		uint256 amountAMin,
		uint256 amountBMin,
		address to,
		uint256 deadline
	)
		internal
		returns (
			uint256 amountA,
			uint256 amountB,
			uint256 liquidity
		)
	{
		IComposableExchange _exchangeAdapter = getExchangeAdapter(_exchangeId);
		return _addLiquidity(_exchangeAdapter, tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline);
	}

	function _addLiquidity(
		IComposableExchange _exchangeAdapter,
		address tokenA,
		address tokenB,
		uint256 amountADesired,
		uint256 amountBDesired,
		uint256 amountAMin,
		uint256 amountBMin,
		address to,
		uint256 deadline
	)
		private
		returns (
			uint256 amountA,
			uint256 amountB,
			uint256 liquidity
		)
	{
		Util memory util;
		util.allowance = IERC20(tokenA).allowance( address(this), address(_exchangeAdapter));
		if(util.allowance < amountADesired){
			IERC20(tokenA).safeIncreaseAllowance(address(_exchangeAdapter), amountADesired.sub(util.allowance));
		}

		util.allowance = IERC20(tokenB).allowance( address(this), address(_exchangeAdapter));
		if(util.allowance < amountBDesired){
			IERC20(tokenB).safeIncreaseAllowance(address(_exchangeAdapter), amountBDesired.sub(util.allowance));
		}

		return _exchangeAdapter.addLiquidity(
			tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline
		);
	}

	function _addLiquidityETH(
		IComposableExchange _exchangeAdapter,
		address token,
		uint256 amountTokenDesired,
		uint256 amountTokenMin,
		uint256 amountETHDesired,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	)
		private
		returns (
			uint256 amountToken,
			uint256 amountETH,
			uint256 liquidity
		)
	{
		uint256 tokenAllowance = IERC20(token).allowance(address(this), address(_exchangeAdapter));
		if(tokenAllowance < amountTokenDesired){
			IERC20(token).safeIncreaseAllowance(address(_exchangeAdapter), amountTokenDesired.sub(tokenAllowance));
		}

		(amountToken, amountETH, liquidity) = _exchangeAdapter.addLiquidityETH{value: amountETHDesired}(
			token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline
		);

		return (amountToken, amountETH, liquidity);
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
		address exchangeAdapterAddress = exchangesConfig.getNetworkExchangeAdapterAddress(chainId, _exchangeId);
		require(exchangeAdapterAddress != address(0), "Exchange adapter not deployed in this network");
		return IComposableExchange(exchangeAdapterAddress);
	}

	function getExchangeAdapter() internal view returns (IComposableExchange) {
		IExchangesConfigModule exchangesConfig = getExchangeConfig();
		uint256 chainId = ConfigGetter.getChainId();
		bytes32[] memory availableExchanges = exchangesConfig.getNetworkExchanges(chainId);
		require(availableExchanges.length > 0, "No exchange adapters deployed in this network");
		address exchangeAdapterAddress = exchangesConfig.getNetworkExchangeAdapterAddress(chainId, availableExchanges[0]);
		return IComposableExchange(exchangeAdapterAddress);
	}

	function getExchangeConfig() private pure returns (IExchangesConfigModule) {
		address configAddress = getConfigAddress();
		require(configAddress != address(0), "Config module not deployed in this network");
		return (IExchangesConfigModule(configAddress));
	}

	function getChainId() internal pure returns (uint256) {
		return ConfigGetter.getChainId();
	}

	function getPoolAddress(address tokenA, address tokenB) internal view returns (address) {
		IComposableExchange _exchangeAdapter = getExchangeAdapter();
		return _exchangeAdapter.getPoolAddress(tokenA, tokenB);
	}
}
