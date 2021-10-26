pragma solidity ^0.6.8;
import "../utils/Operations.sol";

contract OperationsMock {
    event AddressApproved(address to, uint256 value);
    event TokenTransfered(address to, uint256 value);
    event TokenTransferedFrom(address from, address to, uint256 value);
    event ETHTransfered(address to, uint256 value);

    function safeApprove(address token, address to, uint256 value) public {
        Operations.safeApprove(token, to, value);
        emit AddressApproved(to, value);
    }

    function safeTransfer(address token, address to, uint256 value) public {
        Operations.safeTransfer(token, to, value);
        emit TokenTransfered(to, value);
    }

    function safeTransferFrom(address token, address from, address to, uint256 value) public {
        Operations.safeTransferFrom(token, from, to, value);
        emit TokenTransferedFrom(from, to, value);
    }

    function safeTransferETH(address to, uint256 value) public {
        Operations.safeTransferETH(to, value);
        emit ETHTransfered(to, value);
    }

    receive() external payable {}
}
