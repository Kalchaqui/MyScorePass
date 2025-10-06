// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Ins {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract InsurancePoolMini {
    address public owner;
    address public loanManager;
    IERC20Ins public stablecoin;
    uint256 public insuranceFund;
    
    constructor(address _stablecoin) {
        owner = msg.sender;
        stablecoin = IERC20Ins(_stablecoin);
    }
    
    function setLoanManager(address _loanManager) external {
        require(msg.sender == owner);
        loanManager = _loanManager;
    }
    
    function collectPremium(uint256, uint256) external {
        require(msg.sender == loanManager);
        // Premium ya fue transferido, solo registrar
    }
    
    function coverDefault(address, uint256, uint256 _amount, address _pool) external returns (bool) {
        require(msg.sender == loanManager);
        if (insuranceFund >= _amount) {
            require(stablecoin.transfer(_pool, _amount));
            insuranceFund -= _amount;
            return true;
        }
        return false;
    }
}
