/**
 * x402 Service
 * Business logic for x402 payment verification
 */

const config = require('../../shared/config');
const { PaymentRequiredError } = require('../../shared/errors');
const logger = require('../../shared/logger');

class X402Service {
    constructor() {
        this.facilitator = null;

        // Initialize facilitator if in production mode
        if (config.x402Mode === 'production') {
            this._initializeFacilitator();
        }
    }

    _initializeFacilitator() {
        try {
            const { createThirdwebClient } = require('thirdweb');
            const { facilitator } = require('thirdweb/x402');

            const client = createThirdwebClient({
                secretKey: config.thirdwebSecretKey,
            });

            this.facilitator = facilitator({
                client,
                serverWalletAddress: config.thirdwebServerWallet,
            });

            logger.info('x402 Facilitator initialized in production mode');
        } catch (error) {
            logger.error('Failed to initialize x402 facilitator', { error: error.message });
            throw error;
        }
    }

    async verifyPayment(resourceUrl, method, paymentData, amount, currency = 'USDC') {
        // Simulated mode
        if (config.x402Mode === 'simulated') {
            if (!paymentData) {
                // No payment header - return 402
                throw new PaymentRequiredError({
                    amount,
                    currency,
                    network: 'avalanche-fuji',
                    recipient: config.merchantWallet,
                    description: 'Payment required',
                });
            }

            // Payment header present - simulate success
            logger.info('Payment verified (simulated)', { amount, currency });
            return { verified: true, mode: 'simulated' };
        }

        // Production mode
        try {
            const { settlePayment } = require('thirdweb/x402');
            const { defineChain } = require('thirdweb/chains');
            const avalancheFuji = defineChain(43113);

            const result = await settlePayment({
                resourceUrl,
                method,
                paymentData,
                network: avalancheFuji,
                price: `$${amount}`,
                facilitator: this.facilitator,
            });

            if (result.status === 200) {
                logger.info('Payment verified (production)', { amount, currency });
                return { verified: true, mode: 'production' };
            }

            throw new PaymentRequiredError({
                amount,
                currency,
                network: 'avalanche-fuji',
                recipient: config.merchantWallet,
                description: 'Payment verification failed',
            });
        } catch (error) {
            logger.error('Payment verification error', { error: error.message });
            throw error;
        }
    }
}

module.exports = X402Service;
