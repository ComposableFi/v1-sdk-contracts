pragma solidity >=0.6.8;
import "../utils/Operations.sol";
import "../cross-layer/libraries/Swap.sol";
import "../cross-layer/libraries/Oracle.sol";
import "../cross-layer/libraries/Transferal.sol";
import "../cross-layer/interfaces/IVaultBase.sol";
import "../cross-layer/libraries/ExchangeLiquidity.sol";

contract ContractDemo {

	address public owner;

	constructor() public {
		owner = msg.sender;
	}

	function isPaused() public view returns (bool) {
		return Transferal.isPaused();
	}

	function isTokenSupported(address tokenAddress, uint256 networkId) public view returns (bool) {
		return Transferal.isTokenSupported(tokenAddress, networkId);
	}

	function getVaultTokenBalance(address tokenAddress) public view returns (uint256) {
		return Transferal.getVaultTokenBalance(tokenAddress);
	}

	function calculateFeePercentage(address tokenAddress, uint256 amount) public view returns (uint256) {
		return Transferal.calculateFeePercentage(tokenAddress, amount);
	}

	function depositToken(
		uint256 amount,
		address tokenAddress,
		address destinationAddress,
		uint256 remoteNetworkID,
		uint256 transferDelay
	) public {
		address vaultAddress = Transferal.getVaultAddress();
		Operations.safeApprove(tokenAddress, vaultAddress, amount);
		return Transferal.depositToken(amount, tokenAddress, destinationAddress, remoteNetworkID, transferDelay);
	}

	function getSwapAmount(
		address _tokenIn,
		address _tokenOut,
		uint256 _amountIn
	) public view returns (uint256) {
		return Swap.getAmountsOut(_tokenIn, _tokenOut, _amountIn, "");
	}

	function swapTokens(
		address _tokenIn,
		address _tokenOut,
		uint256 _amountIn,
		uint256 _deadline
	) public {
		Swap.swap(_tokenIn, _tokenOut, _amountIn, 0, msg.sender, abi.encodePacked(_deadline));
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
	) external {
		ExchangeLiquidity.addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline);
	}

	function addLiquidityETH(
		address token,
		uint256 amountTokenDesired,
		uint256 amountTokenMin,
		uint256 amountETHDesired,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	) external payable {
		ExchangeLiquidity.addLiquidityETH(token, amountTokenDesired, amountTokenMin, amountETHDesired, amountETHMin, to, deadline);
	}

	function removeLiquidity(
		address tokenA,
		address tokenB,
		uint256 liquidity,
		uint256 amountAMin,
		uint256 amountBMin,
		address to,
		uint256 deadline
	) external {
		ExchangeLiquidity.removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
	}

	function removeLiquidityETH(
		address token,
		uint256 liquidity,
		uint256 amountTokenMin,
		uint256 amountETHMin,
		address to,
		uint256 deadline
	) external returns (uint256 amountToken, uint256 amountETH) {
		return ExchangeLiquidity.removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline);
	}

	function getExchangeAdapter() external view returns (address) {
		return address(ExchangeLiquidity.getExchangeAdapter());
	}

	function getPoolAddress(address tokenA, address tokenB) external view returns (address) {
		return ExchangeLiquidity.getPoolAddress(tokenA, tokenB);
	}

	function getTokenPrice(address token) external view returns (uint256) {
		return Oracle.getTokenPrice(token);
	}

	function retrieveTokens(address token) public {
		require(msg.sender == owner, "Only owner can retrieve tokens");
		uint256 balance = IERC20(token).balanceOf(address(this));
		IERC20(token).transfer(msg.sender, balance);
	}

	function changeOwner(address newOwner) public {
		require(msg.sender == owner, "Only owner can change owner");
		require(newOwner != address(0), "Cannot renounce ownership");
		owner = newOwner;
	}

	event Received(address, uint256);

	receive() external payable {
		emit Received(msg.sender, msg.value);
	}
}
