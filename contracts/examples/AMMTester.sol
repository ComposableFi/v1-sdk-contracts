pragma solidity ^0.6.8;
import "../cross-layer/libraries/Swap.sol";
import "../utils/protocol_config/interfaces/IExchangesConfigModule.sol";

contract AMMTester {
    constructor() public {}

    function getSwapAmount(
        address _tokenIn,
        address _tokenOut,
        uint _amountIn
    ) public view returns(uint256) {
        return Swap.getAmountsOut(_tokenIn, _tokenOut, _amountIn, "");
    }

    function swapTokens(
        address _tokenIn,
        address _tokenOut,
        uint _amountIn,
        uint _deadline
    ) public {
        Swap.swap(_tokenIn, _tokenOut, _amountIn, 0, msg.sender, abi.encodePacked(_deadline));
    }

    function getConfigAddress() public pure returns (address) {
        return Swap.getConfigAddress();
    }

    function getChainId() public pure returns (uint256) {
        return ConfigGetter.getChainId();
    }
}
