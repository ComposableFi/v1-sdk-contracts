// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity >=0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./ISushiswapPair.sol";
import "./ISushiswapRouter.sol";
import "./ISushiswapFactory.sol";
import "../../interfaces/IComposableExchange.sol";

contract SushiswapAdapter is IComposableExchange, OwnableUpgradeable {
	using SafeERC20 for IERC20;
	using SafeMath for uint256;
	ISushiswapRouter public swapRouter;

	function initialize(address swapRouterAddress) public initializer {
		__Ownable_init();
		swapRouter = ISushiswapRouter(swapRouterAddress);
	}

	function swap(
		address tokenIn,
		address tokenOut,
		uint256 amount,
		uint256 amountOutMin,
		bytes calldata data
	) external override returns (uint256) {
		address[] memory path = new address[](2);
		path[0] = tokenIn;
		path[1] = tokenOut;

		uint256 deadline;

		if (data.length != 0) {
			(deadline) = abi.decode(data, (uint256));
		} else {
			deadline = block.timestamp;
		}

		IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);
		IERC20(tokenIn).safeIncreaseAllowance(address(swapRouter), amount);

		uint256[] memory amounts = swapRouter.swapExactTokensForTokens(amount, amountOutMin, path, msg.sender, deadline);
		return amounts[1];
	}

	function getAmountsOut(
		address tokenIn,
		address tokenOut,
		uint256 amountIn,
		bytes calldata
	) external view override returns (uint256) {
		address[] memory path = new address[](2);
		path[0] = tokenIn;
		path[1] = tokenOut;
		uint256[] memory amounts = swapRouter.getAmountsOut(amountIn, path);
		return amounts[1];
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
		IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountADesired);
		IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountBDesired);

		uint256 tokenAllowance;
		tokenAllowance = IERC20(tokenA).allowance(address(this), address(swapRouter));
		if (tokenAllowance < amountADesired) {
			IERC20(tokenA).safeIncreaseAllowance(address(swapRouter), amountADesired.sub(tokenAllowance));
		}
		tokenAllowance = IERC20(tokenB).allowance(address(this), address(swapRouter));
		if (tokenAllowance < amountBDesired) {
			IERC20(tokenB).safeIncreaseAllowance(address(swapRouter), amountBDesired.sub(tokenAllowance));
		}
		(amountA, amountB, liquidity) = swapRouter.addLiquidity(
			tokenA,
			tokenB,
			amountADesired,
			amountBDesired,
			amountAMin,
			amountBMin,
			to,
			deadline
		);
		return (amountA, amountB, liquidity);
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
		IERC20(token).safeTransferFrom(msg.sender, address(this), amountTokenDesired);
		uint256 tokenAllowance = IERC20(token).allowance(address(this), address(swapRouter));
		if (tokenAllowance < amountTokenDesired) {
			IERC20(token).safeIncreaseAllowance(address(swapRouter), amountTokenDesired.sub(tokenAllowance));
		}

		(amountToken, amountETH, liquidity) = swapRouter.addLiquidityETH{ value: msg.value }(
			token,
			amountTokenDesired,
			amountTokenMin,
			amountETHMin,
			to,
			deadline
		);
		return (amountToken, amountETH, liquidity);
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
		address poolAddress = this.getPoolAddress(tokenA, tokenB);
		ISushiswapPair(poolAddress).transferFrom(msg.sender, address(this), liquidity);
		ISushiswapPair(poolAddress).approve(address(swapRouter), liquidity);

		(amountA, amountB) = swapRouter.removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
		return (amountA, amountB);
	}

	function removeLiquidityETH(
		address token,
		uint256 liquidity,
		uint256 amountTokenMin,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	) external override returns (uint256 amountToken, uint256 amountETH) {
		address poolAddress = this.getPoolAddress(token, address(0x0));
		ISushiswapPair(poolAddress).transferFrom(msg.sender, address(this), liquidity);
		ISushiswapPair(poolAddress).approve(address(swapRouter), liquidity);

		(amountToken, amountETH) = swapRouter.removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline);
		return (amountToken, amountETH);
	}

	function getPoolAddress(address tokenA, address tokenB) external view override returns (address) {
		if (tokenB == address(0x0)) {
			tokenB = swapRouter.WETH();
		}
		address factoryAddress = swapRouter.factory();
		return ISushiswapFactory(factoryAddress).getPair(tokenA, tokenB);
	}
}
