// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity >=0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "../../interfaces/IComposableExchange.sol";
import "./ICurveRouter.sol";
import "./IAddressProvider.sol";

contract CurveAdapter is IComposableExchange, OwnableUpgradeable {
	using SafeERC20 for IERC20;
	IAddressProvider public addressProvider;

	function initialize(address _addr) public initializer {
		__Ownable_init();
		addressProvider = IAddressProvider(_addr);
	}

	function swap(
		address tokenIn,
		address tokenOut,
		uint256 amount,
		uint256 amountOutMin,
		bytes calldata
	) external override returns (uint256) {
		// 2 is the id of the curve exchange contract
		// https://curve.readthedocs.io/registry-address-provider.html#address-ids
		ICurveRouter swapRouter = ICurveRouter(addressProvider.get_address(2));

		IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);
		IERC20(tokenIn).safeIncreaseAllowance(address(swapRouter), amount);

		return swapRouter.exchange_with_best_rate(tokenIn, tokenOut, amount, amountOutMin, msg.sender);
	}

	function getAmountsOut(
		address tokenIn,
		address tokenOut,
		uint256 amountIn,
		bytes calldata
	) external view override returns (uint256) {
		ICurveRouter swapRouter = ICurveRouter(addressProvider.get_address(2));

		(, uint256 amountOut) = swapRouter.get_best_rate(tokenIn, tokenOut, amountIn);

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
		return (amountA, amountB);
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
		require(false, "Function addLiquidityETH not implemented");
	}

	function getPoolAddress(address tokenA, address tokenB) external view override returns (address) {
		return address(0x0);
	}
}
