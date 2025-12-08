/**
 * MockUser Controller
 * Handles HTTP requests for mock user queries
 */

const { asyncHandler } = require('../middlewares/errorHandler');
const MockUserService = require('../../core/services/MockUserService');
const SubscriptionService = require('../../core/services/SubscriptionService');

const mockUserService = new MockUserService();
const subscriptionService = new SubscriptionService();

const queryUsers = asyncHandler(async (req, res) => {
    const { minScore, maxScore, verificationLevel, name } = req.query;

    // Consume 1 credit
    await subscriptionService.consumeCredits(req.exchangeId, 1);

    // Query users
    const result = await mockUserService.queryUsers({
        minScore: minScore ? parseInt(minScore) : undefined,
        maxScore: maxScore ? parseInt(maxScore) : undefined,
        verificationLevel: verificationLevel ? parseInt(verificationLevel) : undefined,
        name,
    });

    res.json({
        success: true,
        data: result,
        creditsConsumed: 1,
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Consume 1 credit
    await subscriptionService.consumeCredits(req.exchangeId, 1);

    // Get user
    const user = await mockUserService.getUserById(id);

    res.json({
        success: true,
        data: user,
        creditsConsumed: 1,
    });
});

const getStats = asyncHandler(async (req, res) => {
    const stats = await mockUserService.getStats();

    res.json({
        success: true,
        data: stats,
    });
});

module.exports = {
    queryUsers,
    getUserById,
    getStats,
};
