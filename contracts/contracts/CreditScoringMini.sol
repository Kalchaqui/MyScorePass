// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CreditScoringMini {
    address public owner;
    
    struct Score {
        uint256 score;
        uint256 maxLoan;
    }
    
    mapping(address => Score) public scores;
    mapping(address => bool) public blacklisted;
    
    constructor() {
        owner = msg.sender;
    }
    
    function calculateInitialScore(address _user) external returns (uint256) {
        scores[_user] = Score(300, 300 * 10**6);
        return 300;
    }
    
    function getScore(address _user) external view returns (uint256 score, uint256 maxLoanAmount, uint256 lastUpdated) {
        return (scores[_user].score, scores[_user].maxLoan, block.timestamp);
    }
    
    function penalizeScore(address _user, uint256 _penalty) external {
        require(msg.sender == owner);
        scores[_user].score = scores[_user].score > _penalty ? scores[_user].score - _penalty : 0;
        blacklisted[_user] = true;
    }
    
    function rewardScore(address _user, uint256 _reward) external {
        require(msg.sender == owner);
        scores[_user].score += _reward;
        scores[_user].maxLoan = scores[_user].score * 10**6;
    }
    
    function isBlacklisted(address _user) external view returns (bool) {
        return blacklisted[_user];
    }
    
    function transferOwnership(address newOwner) external {
        require(msg.sender == owner);
        owner = newOwner;
    }
}
