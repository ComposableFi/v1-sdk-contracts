pragma solidity ^0.6.8;

interface IUniswapV3Pool {
    function mint(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount,
        bytes calldata data
    ) external returns (uint256 amount0, uint256 amount1);
}

//Add them to the same doc
//1. Arbitrum is blocker (AMM, Oracles, etc)
//2. Issues that are tough right now but can be resolved given more time