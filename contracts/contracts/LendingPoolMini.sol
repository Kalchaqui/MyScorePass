// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Mini {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract LendingPoolMini {
    address public owner;
    address public loanManager;
    IERC20Mini public stablecoin;
    
    mapping(address => uint256) public deposits;
    uint256 public totalDeposits;
    
    constructor(address _stablecoin) {
        owner = msg.sender;
        stablecoin = IERC20Mini(_stablecoin);
    }
    
    function setLoanManager(address _loanManager) external {
        require(msg.sender == owner);
        loanManager = _loanManager;
    }
    
    function deposit(uint256 _amount) external {
        require(stablecoin.transferFrom(msg.sender, address(this), _amount));
        deposits[msg.sender] += _amount;
        totalDeposits += _amount;
    }
    
    function withdraw(uint256 _amount) external {
        require(deposits[msg.sender] >= _amount);
        deposits[msg.sender] -= _amount;
        totalDeposits -= _amount;
        require(stablecoin.transfer(msg.sender, _amount));
    }
    
    function disburseLoan(address _borrower, uint256 _amount) external {
        require(msg.sender == loanManager);
        require(stablecoin.transfer(_borrower, _amount));
    }
    
    function receiveLoanRepayment(address, uint256, uint256) external {
        require(msg.sender == loanManager);
    }
    
    function getAvailableLiquidity() external view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }
}
