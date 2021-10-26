// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "../../interfaces/IComposableExchange.sol";
import "./IUniswapV2Router02.sol";

contract UniswapV2Adapter is IComposableExchange, OwnableUpgradeable {

    using SafeERC20 for IERC20;
    IUniswapV2Router02 public swapRouter;

    function initialize(address swapRouterAddress) public initializer {
        __Ownable_init();
        swapRouter = IUniswapV2Router02(swapRouterAddress);
    }

    function swap(address tokenIn, address tokenOut, uint256 amount, uint256 amountOutMin, bytes calldata data)
    override
    external
    returns (uint256)
    {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        uint deadline;

        if (data.length != 0) {
            (deadline) = abi.decode(data, (uint256));
        } else {
            deadline = block.timestamp;
        }

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(tokenIn).safeIncreaseAllowance(address(swapRouter), amount);

        uint[] memory amounts = swapRouter.swapExactTokensForTokens(amount, amountOutMin, path, msg.sender, deadline);
        return amounts[1];
    }

    function getAmountsOut(address tokenIn, address tokenOut, uint256 amountIn, bytes calldata)
    external
    view
    override
    returns(uint256) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        uint[] memory amounts = swapRouter.getAmountsOut(amountIn, path);
        return amounts[1];
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
        (amountA, amountB, liquidity) = swapRouter.addLiquidity(
            tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline
        );
        return (amountA, amountB, liquidity);
    }

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external override payable returns (uint amountToken, uint amountETH, uint liquidity) {
        (amountToken, amountETH, liquidity) = swapRouter.addLiquidityETH(
            token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline
        );
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
        (amountA, amountB) = swapRouter.removeLiquidity(
            tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline
        );
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
        (amountToken, amountETH) = swapRouter.removeLiquidityETH(
            token, liquidity, amountTokenMin, amountETHMin, to, deadline
        );
        return (amountToken, amountETH);
    }

    function getPoolAddress(address tokenA, address tokenB) external view override returns (address) {
        return address(0x0);
    }
}
