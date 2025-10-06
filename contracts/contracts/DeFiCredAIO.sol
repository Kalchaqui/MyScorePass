// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DeFiCredAIO (All-In-One)
 * @dev Versión ultra-compacta para Paseo - Todas las funciones en 1 contrato
 */
contract DeFiCredAIO {
    address public owner;
    address public usdcToken;
    
    struct User {
        uint256 score;
        uint256 maxLoan;
        bool blacklisted;
        bool hasLoan;
    }
    
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 installments;
        uint256 paid;
        uint256 installmentAmount;
    }
    
    mapping(address => User) public users;
    mapping(uint256 => Loan) public loans;
    uint256 public loanCount;
    
    event LoanCreated(uint256 loanId, address borrower, uint256 amount);
    event LoanPaid(uint256 loanId, address borrower);
    
    constructor(address _usdc) {
        owner = msg.sender;
        usdcToken = _usdc;
    }
    
    function createProfile() external {
        users[msg.sender].score = 300;
        users[msg.sender].maxLoan = 300 * 10**6;
    }
    
    function requestLoan(uint256 _amount, uint256 _installments) external returns (uint256) {
        require(!users[msg.sender].blacklisted, "Blacklisted");
        require(_amount <= users[msg.sender].maxLoan, "Exceeds limit");
        require(!users[msg.sender].hasLoan, "Has active loan");
        
        loanCount++;
        uint256 rate = _installments == 1 ? 500 : _installments == 3 ? 800 : _installments == 6 ? 1200 : 1800;
        uint256 interest = (_amount * rate * _installments) / 120000;
        uint256 installmentAmount = (_amount + interest) / _installments;
        
        loans[loanCount] = Loan(msg.sender, _amount, _installments, 0, installmentAmount);
        users[msg.sender].hasLoan = true;
        
        emit LoanCreated(loanCount, msg.sender, _amount);
        return loanCount;
    }
    
    function payInstallment(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender);
        
        loan.paid++;
        if (loan.paid >= loan.installments) {
            users[msg.sender].hasLoan = false;
            users[msg.sender].score += 50;
            emit LoanPaid(_loanId, msg.sender);
        }
    }
    
    function getUser(address _user) external view returns (uint256 score, uint256 maxLoan, bool blacklisted, bool hasLoan) {
        User memory u = users[_user];
        return (u.score, u.maxLoan, u.blacklisted, u.hasLoan);
    }
    
    function getLoan(uint256 _loanId) external view returns (address borrower, uint256 amount, uint256 installments, uint256 paid) {
        Loan memory l = loans[_loanId];
        return (l.borrower, l.amount, l.installments, l.paid);
    }
}
