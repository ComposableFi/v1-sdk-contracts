// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity ^0.6.8;

interface ICurveRouter {

    // uses high gas fee to find the pool with best rate
    function exchange_with_best_rate(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address recipient
    ) external payable returns (uint256 amountReceived);

    // needs a pool address to swap from
    function exchange(
        address pool,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address recipient
    ) external payable returns (uint256 amountReceived);

    // returns the address of the pool to exchange from and the excepted amount received
    function get_best_rate(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (address pool, uint256 amountOut);

}