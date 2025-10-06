// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CreditScoringMini.sol";
import "./LendingPoolMini.sol";
import "./InsurancePoolMini.sol";

interface IERC20LM {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract LoanManagerMini {
    address public owner;
    
    enum LoanStatus { Pending, Active, Repaid, Defaulted }
    
    struct Loan {
        address borrower;
        uint256 principal;
        uint256 installments;
        uint256 paid;
        uint256 installmentAmount;
        LoanStatus status;
    }
    
    CreditScoringMini public creditScoring;
    LendingPoolMini public lendingPool;
    InsurancePoolMini public insurancePool;
    IERC20LM public stablecoin;
    
    mapping(uint256 => Loan) public loans;
    uint256 public loanCounter;
    
    event LoanCreated(uint256 loanId, address borrower, uint256 amount);
    
    constructor(address _scoring, address _pool, address _insurance, address _usdc) {
        owner = msg.sender;
        creditScoring = CreditScoringMini(_scoring);
        lendingPool = LendingPoolMini(_pool);
        insurancePool = InsurancePoolMini(_insurance);
        stablecoin = IERC20LM(_usdc);
    }
    
    function requestLoan(uint256 _amount, uint256 _installments) external returns (uint256) {
        require(!creditScoring.isBlacklisted(msg.sender), "Blacklisted");
        
        (uint256 score, uint256 maxLoan,) = creditScoring.getScore(msg.sender);
        require(_amount <= maxLoan, "Exceeds limit");
        
        loanCounter++;
        
        uint256 rate = _installments == 1 ? 500 : _installments == 3 ? 800 : _installments == 6 ? 1200 : 1800;
        uint256 interest = (_amount * rate * _installments) / (12 * 10000);
        uint256 total = _amount + interest;
        uint256 installmentAmount = total / _installments;
        
        loans[loanCounter] = Loan(msg.sender, _amount, _installments, 0, installmentAmount, LoanStatus.Active);
        
        lendingPool.disburseLoan(msg.sender, _amount);
        
        emit LoanCreated(loanCounter, msg.sender, _amount);
        return loanCounter;
    }
    
    function payInstallment(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender);
        require(loan.status == LoanStatus.Active);
        
        require(stablecoin.transferFrom(msg.sender, address(lendingPool), loan.installmentAmount));
        
        loan.paid++;
        if (loan.paid >= loan.installments) {
            loan.status = LoanStatus.Repaid;
            creditScoring.rewardScore(msg.sender, 50);
        }
    }
}
