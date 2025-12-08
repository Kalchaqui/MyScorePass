// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreditScoringMini
 * @dev On-chain credit scoring system for MyScorePass
 * @notice Manages credit scores, loan limits, and blacklist functionality
 * @author MyScorePass Team
 */
contract CreditScoringMini is Ownable {
    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @dev Credit score data structure
    struct Score {
        uint256 score; // Credit score (0-1000)
        uint256 maxLoan; // Maximum loan amount in USDC (6 decimals)
        uint256 lastUpdated; // Timestamp of last update
    }

    /// @dev Mapping from user address to their score
    mapping(address => Score) public scores;

    /// @dev Mapping from user address to blacklist status
    mapping(address => bool) public blacklisted;

    // ============================================
    // EVENTS
    // ============================================

    /**
     * @dev Emitted when a user's score is updated
     * @param user Address of the user
     * @param newScore New credit score value
     * @param newMaxLoan New maximum loan amount
     * @param reason Reason for the update
     */
    event ScoreUpdated(
        address indexed user,
        uint256 newScore,
        uint256 newMaxLoan,
        string reason
    );

    /**
     * @dev Emitted when a user is blacklisted
     * @param user Address of the blacklisted user
     */
    event UserBlacklisted(address indexed user);

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @dev Initializes the contract setting the deployer as the owner
     */
    constructor() Ownable(msg.sender) {}

    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================

    /**
     * @dev Calculates and sets the initial credit score for a user
     * @notice Initial score is fixed at 300 (MVP implementation)
     * @param _user Address of the user
     * @return uint256 The initial score (300)
     */
    function calculateInitialScore(address _user) external returns (uint256) {
        scores[_user] = Score({
            score: 300,
            maxLoan: 300 * 10 ** 6, // 300 USDC
            lastUpdated: block.timestamp
        });

        emit ScoreUpdated(_user, 300, 300 * 10 ** 6, "Initial Calculation");
        return 300;
    }

    /**
     * @dev Gets the credit score information for a user
     * @param _user Address of the user
     * @return score Credit score value
     * @return maxLoanAmount Maximum loan amount in USDC
     * @return lastUpdated Timestamp of last update
     */
    function getScore(
        address _user
    )
        external
        view
        returns (uint256 score, uint256 maxLoanAmount, uint256 lastUpdated)
    {
        return (
            scores[_user].score,
            scores[_user].maxLoan,
            scores[_user].lastUpdated
        );
    }

    /**
     * @dev Penalizes a user's credit score
     * @notice Only callable by owner (backend/oracle)
     * @notice If score reaches 0, user is automatically blacklisted
     * @param _user Address of the user
     * @param _penalty Amount to subtract from score
     */
    function penalizeScore(address _user, uint256 _penalty) external onlyOwner {
        uint256 currentScore = scores[_user].score;
        uint256 newScore = currentScore > _penalty
            ? currentScore - _penalty
            : 0;

        scores[_user].score = newScore;
        scores[_user].lastUpdated = block.timestamp;

        // Blacklist user if score reaches 0
        if (newScore == 0) {
            blacklisted[_user] = true;
            emit UserBlacklisted(_user);
        }

        emit ScoreUpdated(_user, newScore, scores[_user].maxLoan, "Penalty");
    }

    /**
     * @dev Rewards a user's credit score
     * @notice Only callable by owner (backend/oracle)
     * @notice Score is capped at 1000
     * @param _user Address of the user
     * @param _reward Amount to add to score
     */
    function rewardScore(address _user, uint256 _reward) external onlyOwner {
        uint256 currentScore = scores[_user].score;
        uint256 newScore = currentScore + _reward;

        // Cap score at 1000
        if (newScore > 1000) {
            newScore = 1000;
        }

        scores[_user].score = newScore;
        scores[_user].maxLoan = newScore * 10 ** 6; // 1 point = 1 USDC
        scores[_user].lastUpdated = block.timestamp;

        emit ScoreUpdated(_user, newScore, scores[_user].maxLoan, "Reward");
    }

    /**
     * @dev Checks if a user is blacklisted
     * @param _user Address of the user
     * @return bool True if user is blacklisted
     */
    function isBlacklisted(address _user) external view returns (bool) {
        return blacklisted[_user];
    }
}
