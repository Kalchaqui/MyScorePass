// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICreditScoring {
    function isBlacklisted(address) external view returns (bool);
    function getScore(address) external view returns (uint256, uint256, uint256);
    function rewardScore(address, uint256) external;
}

interface ILendingPool {
    function disburseLoan(address, uint256) external;
}

interface IUSDC {
    function transferFrom(address, address, uint256) external returns (bool);
}

contract LoanManagerMicro {
    address public owner;
    
    enum Status { Active, Repaid }
    
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 installments;
        uint256 paid;
        uint256 installmentAmt;
        Status status;
    }
    
    ICreditScoring public scoring;
    ILendingPool public pool;
    IUSDC public usdc;
    
    mapping(uint256 => Loan) public loans;
    uint256 public loanCount;
    
    event LoanCreated(uint256 id, address borrower, uint256 amount);
    
    constructor(address _s, address _p, address _u) {
        owner = msg.sender;
        scoring = ICreditScoring(_s);
        pool = ILendingPool(_p);
        usdc = IUSDC(_u);
    }
    
    function requestLoan(uint256 _amt, uint256 _inst) external returns (uint256) {
        require(!scoring.isBlacklisted(msg.sender));
        (,uint256 max,) = scoring.getScore(msg.sender);
        require(_amt <= max);
        
        loanCount++;
        uint256 r = _inst == 1 ? 500 : _inst == 3 ? 800 : _inst == 6 ? 1200 : 1800;
        uint256 i = (_amt * r * _inst) / 120000;
        uint256 instAmt = (_amt + i) / _inst;
        
        loans[loanCount] = Loan(msg.sender, _amt, _inst, 0, instAmt, Status.Active);
        pool.disburseLoan(msg.sender, _amt);
        
        emit LoanCreated(loanCount, msg.sender, _amt);
        return loanCount;
    }
    
    function payInstallment(uint256 _id) external {
        Loan storage l = loans[_id];
        require(l.borrower == msg.sender);
        require(usdc.transferFrom(msg.sender, address(pool), l.installmentAmt));
        
        l.paid++;
        if (l.paid >= l.installments) {
            l.status = Status.Repaid;
            scoring.rewardScore(msg.sender, 50);
        }
    }
}
