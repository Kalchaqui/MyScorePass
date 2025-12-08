/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches exchange to request
 */

const jwt = require('jsonwebtoken');
const config = require('../../shared/config');
const { AuthenticationError } = require('../../shared/errors');
const ExchangeRepository = require('../../core/repositories/ExchangeRepository');

const exchangeRepository = new ExchangeRepository();

async function requireAuth(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtSecret);
        } catch (error) {
            throw new AuthenticationError('Invalid or expired token');
        }

        // Get exchange from database
        const exchange = await exchangeRepository.findById(decoded.exchangeId);

        if (!exchange) {
            throw new AuthenticationError('Exchange not found');
        }

        // Attach exchange to request
        req.exchange = exchange;
        req.exchangeId = exchange.id;

        next();
    } catch (error) {
        next(error);
    }
}

// Optional auth (doesn't throw if no token)
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, config.jwtSecret);
            const exchange = await exchangeRepository.findById(decoded.exchangeId);

            if (exchange) {
                req.exchange = exchange;
                req.exchangeId = exchange.id;
            }
        }

        next();
    } catch (error) {
        // Ignore auth errors for optional auth
        next();
    }
}

module.exports = {
    requireAuth,
    optionalAuth,
};
