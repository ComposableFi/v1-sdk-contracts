// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity >=0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "../../interfaces/IComposableExchange.sol";
import "./IExchangeProxy.sol";

contract BalancerV1Adapter is IComposableExchange, OwnableUpgradeable {
	using SafeERC20 for IERC20;
	IExchangeProxy public exchange;

	function initialize(address _exchangeAddress) public initializer {
		__Ownable_init();
		exchange = IExchangeProxy(_exchangeAddress);
	}

	function swap(
		address tokenIn,
		address tokenOut,
		uint256 amount,
		uint256 amountOutMin,
		bytes calldata data
	) external override returns (uint256) {
		IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);
		IERC20(tokenIn).safeIncreaseAllowance(address(exchange), amount);

		uint256 nPools = abi.decode(data, (uint256));

		return exchange.smartSwapExactIn(TokenInterface(tokenIn), TokenInterface(tokenOut), amount, amountOutMin, nPools);
	}

	function getAmountsOut(
		address tokenIn,
		address tokenOut,
		uint256 amountIn,
		bytes calldata data
	) external view override returns (uint256) {
		uint256 nPools = abi.decode(data, (uint256));
		(, uint256 amountOut) = exchange.viewSplitExactIn(tokenIn, tokenOut, amountIn, nPools);
		return amountOut;
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
		external
		override
		returns (
			uint256 amountA,
			uint256 amountB,
			uint256 liquidity
		)
	{
		//return (amountA, amountB, liquidity);
		require(false, "Function addLiquidity not implemented");
	}

	function addLiquidityETH(
		address token,
		uint256 amountTokenDesired,
		uint256 amountTokenMin,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	)
		external
		payable
		override
		returns (
			uint256 amountToken,
			uint256 amountETH,
			uint256 liquidity
		)
	{
		//return (amountToken, amountETH, liquidity);
		require(false, "Function addLiquidityETH not implemented");
	}

	function removeLiquidity(
		address tokenA,
		address tokenB,
		uint256 liquidity,
		uint256 amountAMin,
		uint256 amountBMin,
		address to,
		uint256 deadline
	) external override returns (uint256 amountA, uint256 amountB) {
		//return (amountA, amountB);
		require(false, "Function removeLiquidity not implemented");
	}

	function removeLiquidityETH(
		address token,
		uint256 liquidity,
		uint256 amountTokenMin,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	) external override returns (uint256 amountToken, uint256 amountETH) {
		//return (amountToken, amountETH);
		require(false, "Function removeLiquidityETH not implemented");
	}

	function getPoolAddress(address tokenA, address tokenB) external view override returns (address) {
		return address(0x0);
	}
}
