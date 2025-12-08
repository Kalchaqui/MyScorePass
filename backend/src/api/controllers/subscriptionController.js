/**
 * Subscription Controller
 * Handles HTTP requests for subscriptions and credits
 */

const { asyncHandler } = require('../middlewares/errorHandler');
const SubscriptionService = require('../../core/services/SubscriptionService');
const X402Service = require('../../core/services/X402Service');

const subscriptionService = new SubscriptionService();
const x402Service = new X402Service();

const purchaseCredits = asyncHandler(async (req, res) => {
    const { credits } = req.body;
    const paymentHeader = req.headers['x-payment'];

    // Calculate amount
    const amount = subscriptionService.calculatePrice(credits);

    // Verify x402 payment
    const resourceUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    await x402Service.verifyPayment(resourceUrl, req.method, paymentHeader, amount);

    // Payment verified - process purchase
    const result = await subscriptionService.purchaseCredits(
        req.exchangeId,
        credits,
        paymentHeader || 'simulated'
    );

    res.json({
        success: true,
        data: result,
    });
});

const getBalance = asyncHandler(async (req, res) => {
    const balance = await subscriptionService.getBalance(req.exchangeId);

    res.json({
        success: true,
        data: balance,
    });
});

const getUsage = asyncHandler(async (req, res) => {
    const usage = await subscriptionService.getUsageHistory(req.exchangeId);

    res.json({
        success: true,
        data: usage,
    });
});

module.exports = {
    purchaseCredits,
    getBalance,
    getUsage,
};
