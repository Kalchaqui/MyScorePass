/**
 * Subscription Service
 * Business logic for subscription and credit management
 */

const { PRICING } = require('../../shared/constants');
const { ValidationError, InsufficientCreditsError } = require('../../shared/errors');
const ExchangeRepository = require('../repositories/ExchangeRepository');
const logger = require('../../shared/logger');

class SubscriptionService {
    constructor() {
        this.exchangeRepository = new ExchangeRepository();
    }

    calculatePrice(credits) {
        return credits * PRICING.USDC_PER_CREDIT;
    }

    async purchaseCredits(exchangeId, credits, paymentProof) {
        // Validation
        if (!credits || credits < PRICING.MIN_PURCHASE_CREDITS) {
            throw new ValidationError(`Minimum purchase is ${PRICING.MIN_PURCHASE_CREDITS} credits`);
        }

        const amount = this.calculatePrice(credits);

        // Add credits to exchange
        const updatedExchange = await this.exchangeRepository.addCredits(exchangeId, credits);

        logger.info('Credits purchased', {
            exchangeId,
            credits,
            amount,
            paymentProof,
        });

        return {
            creditsAdded: credits,
            newBalance: updatedExchange.credits,
            amountPaid: amount,
        };
    }

    async getBalance(exchangeId) {
        const exchange = await this.exchangeRepository.findById(exchangeId);

        return {
            credits: exchange.credits,
            totalPurchased: exchange.totalPurchased,
            totalConsumed: exchange.totalConsumed,
            pricing: {
                usdcPerCredit: PRICING.USDC_PER_CREDIT,
                minPurchase: PRICING.MIN_PURCHASE_CREDITS,
            },
        };
    }

    async consumeCredits(exchangeId, amount = 1) {
        const exchange = await this.exchangeRepository.findById(exchangeId);

        if (exchange.credits < amount) {
            throw new InsufficientCreditsError(amount, exchange.credits);
        }

        const updatedExchange = await this.exchangeRepository.consumeCredits(exchangeId, amount);

        logger.info('Credits consumed', {
            exchangeId,
            amount,
            remainingCredits: updatedExchange.credits,
        });

        return {
            consumed: amount,
            remaining: updatedExchange.credits,
        };
    }

    async getUsageHistory(exchangeId) {
        // TODO: Implement transaction history
        // For now, return basic info
        const exchange = await this.exchangeRepository.findById(exchangeId);

        return {
            totalPurchased: exchange.totalPurchased,
            totalConsumed: exchange.totalConsumed,
            currentBalance: exchange.credits,
            transactions: [], // TODO: Implement transaction log
        };
    }
}

module.exports = SubscriptionService;
