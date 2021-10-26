// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import "../../interfaces/IComposableExchange.sol";
import "./ISwapRouter.sol";
import "./IQuoter.sol";

// @title UniswapAdapter
// @notice Uniswap V3
contract UniswapAdapter is IComposableExchange, OwnableUpgradeable {
    ISwapRouter public swapRouter;
    IQuoter public quoter;

    function initialize(address swapRouterAddress, address quoterAddress)
    public
    initializer
    {
        swapRouter = ISwapRouter(swapRouterAddress);
        quoter = IQuoter(quoterAddress);
    }

    function swap(address tokenIn, address tokenOut, uint256 amount, uint256 amountOutMin, bytes calldata data)
    override
    external
    returns (uint256)
    {
        SafeERC20.safeTransferFrom(IERC20(tokenIn), msg.sender, address(this), amount);
        SafeERC20.safeApprove(IERC20(tokenIn), address(swapRouter), amount);
        (uint256 deadline, uint160 sqrtPriceLimitX96, uint24 fee) = abi.decode(data, (uint256, uint160, uint24));

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
            tokenIn,
            tokenOut,
            fee,
            msg.sender,
            deadline,
            amount,
            amountOutMin,
            sqrtPriceLimitX96
        );
        return swapRouter.exactInputSingle(params);
    }

    function getAmountsOut(address tokenIn, address tokenOut, uint256 amountIn, bytes calldata data) external view override returns (uint256) {
        (uint160 sqrtPriceLimitX96, uint24 fee) = abi.decode(data, (uint160, uint24));
        return quoter.quoteExactInputSingle(
            tokenIn,
            tokenOut,
            fee,
            amountIn,
            sqrtPriceLimitX96
        );
    }

    function addLiquidity(address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount,
        bytes calldata data
    ) external returns (uint256 amount0, uint256 amount1) {
        return (amount0, amount1);
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external override returns (uint amountA, uint amountB, uint liquidity){
        return (amountA, amountB, liquidity);
    }

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable override returns (uint amountToken, uint amountETH, uint liquidity) {
        return (amountToken, amountETH, liquidity);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external override returns (uint amountA, uint amountB) {
        return (amountA, amountB);
    }

    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external override returns (uint amountToken, uint amountETH) {
        return (amountToken, amountETH);
    }

    function getPoolAddress(address tokenA, address tokenB) external view override returns (address) {
        return address(0x0);
    }
}
