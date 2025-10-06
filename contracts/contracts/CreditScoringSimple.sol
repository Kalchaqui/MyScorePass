// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IdentityRegistrySimple.sol";

/**
 * @title CreditScoringSimple
 * @dev Versión ultra-simplificada para Paseo (<49KB)
 */
contract CreditScoringSimple {
    
    address public owner;
    IdentityRegistrySimple public identityRegistry;
    
    struct CreditScore {
        uint256 score;
        uint256 maxLoanAmount;
        uint256 lastUpdated;
    }
    
    mapping(address => CreditScore) public creditScores;
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public defaultCount;
    
    event ScoreCalculated(address indexed user, uint256 score, uint256 maxLoanAmount);
    event UserBlacklisted(address indexed user, uint256 defaultCount);
    
    constructor(address _identityRegistry) {
        owner = msg.sender;
        identityRegistry = IdentityRegistrySimple(_identityRegistry);
    }
    
    function calculateInitialScore(address _user) external returns (uint256) {
        (,bool isVerified, uint256 level, uint256 createdAt, uint256 docs) = identityRegistry.getIdentity(_user);
        require(isVerified, "Not verified");
        
        uint256 score = 0;
        
        // Nivel (40%)
        if (level == 1) score += 200;
        else if (level == 2) score += 300;
        else if (level == 3) score += 400;
        
        // Docs (30%)
        uint256 docScore = docs > 5 ? 5 : docs;
        score += docScore * 60;
        
        // Antigüedad (30%)
        uint256 daysOld = (block.timestamp - createdAt) / 1 days;
        if (daysOld > 90) daysOld = 90;
        score += (daysOld * 300) / 90;
        
        // Calcular límite
        uint256 baseAmount;
        if (level == 1) baseAmount = 100 * 10**6;
        else if (level == 2) baseAmount = 300 * 10**6;
        else baseAmount = 500 * 10**6;
        
        uint256 maxLoan = (baseAmount * (100 + (score * 30) / 1000)) / 100;
        
        creditScores[_user] = CreditScore(score, maxLoan, block.timestamp);
        
        emit ScoreCalculated(_user, score, maxLoan);
        return score;
    }
    
    function getScore(address _user) external view returns (uint256 score, uint256 maxLoanAmount, uint256 lastUpdated) {
        CreditScore memory cs = creditScores[_user];
        return (cs.score, cs.maxLoanAmount, cs.lastUpdated);
    }
    
    function penalizeScore(address _user, uint256 _penalty) external {
        require(msg.sender == owner, "Only owner");
        
        uint256 oldScore = creditScores[_user].score;
        uint256 newScore = oldScore > _penalty ? oldScore - _penalty : 0;
        
        creditScores[_user].score = newScore;
        creditScores[_user].maxLoanAmount = newScore > 0 ? (creditScores[_user].maxLoanAmount * newScore / oldScore) : 0;
        
        defaultCount[_user]++;
        if (defaultCount[_user] >= 2) {
            blacklisted[_user] = true;
            emit UserBlacklisted(_user, defaultCount[_user]);
        }
    }
    
    function rewardScore(address _user, uint256 _reward) external {
        require(msg.sender == owner, "Only owner");
        
        uint256 newScore = creditScores[_user].score + _reward;
        if (newScore > 1000) newScore = 1000;
        
        creditScores[_user].score = newScore;
        uint256 level = identityRegistry.getVerificationLevel(_user);
        
        uint256 baseAmount;
        if (level == 1) baseAmount = 100 * 10**6;
        else if (level == 2) baseAmount = 300 * 10**6;
        else baseAmount = 500 * 10**6;
        
        creditScores[_user].maxLoanAmount = (baseAmount * (100 + (newScore * 30) / 1000)) / 100;
    }
    
    function isBlacklisted(address _user) external view returns (bool) {
        return blacklisted[_user];
    }
    
    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Only owner");
        owner = newOwner;
    }
}
