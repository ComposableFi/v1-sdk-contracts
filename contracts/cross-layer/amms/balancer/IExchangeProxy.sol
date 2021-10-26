// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

interface TokenInterface {
}

// https://docs.balancer.fi/v/v1/smart-contracts/exchange-proxy
// https://github.com/balancer-labs/balancer-registry/blob/master/contracts/ExchangeProxy.sol
interface IExchangeProxy {

    struct Swap {
        address pool;
        address tokenIn;
        address tokenOut;
        uint    swapAmount; // tokenInAmount / tokenOutAmount
        uint    limitReturnAmount; // minAmountOut / maxAmountIn
        uint    maxPrice;
    }

    function smartSwapExactIn(
        TokenInterface tokenIn,
        TokenInterface tokenOut,
        uint totalAmountIn,
        uint minTotalAmountOut,
        uint nPools
    ) external payable returns (uint totalAmountOut);

    function viewSplitExactIn(
        address tokenIn,
        address tokenOut,
        uint swapAmount,
        uint nPools
    ) external view returns (Swap[] memory swaps, uint totalOutput);

}