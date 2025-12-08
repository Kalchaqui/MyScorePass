/**
 * Authentication Service
 * Business logic for authentication and authorization
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../shared/config');
const { ValidationError, AuthenticationError, ConflictError } = require('../../shared/errors');
const ExchangeRepository = require('../repositories/ExchangeRepository');

class AuthService {
    constructor() {
        this.exchangeRepository = new ExchangeRepository();
    }

    async register(exchangeData) {
        const { name, email, password, walletAddress } = exchangeData;

        // Validation
        if (!name || !email || !password) {
            throw new ValidationError('Name, email, and password are required');
        }

        if (password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters');
        }

        // Check if email already exists
        const existing = await this.exchangeRepository.findByEmail(email);
        if (existing) {
            throw new ConflictError('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create exchange
        const exchange = await this.exchangeRepository.create({
            name,
            email,
            password: hashedPassword,
            walletAddress: walletAddress || null,
        });

        // Generate token
        const token = this._generateToken(exchange.id);

        // Remove password from response
        const { password: _, ...exchangeWithoutPassword } = exchange;

        return {
            exchange: exchangeWithoutPassword,
            token,
        };
    }

    async login(email, password) {
        // Validation
        if (!email || !password) {
            throw new ValidationError('Email and password are required');
        }

        // Find exchange
        const exchange = await this.exchangeRepository.findByEmail(email);
        if (!exchange) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, exchange.password);
        if (!isValid) {
            throw new AuthenticationError('Invalid credentials');
        }

        // Generate token
        const token = this._generateToken(exchange.id);

        // Remove password from response
        const { password: _, ...exchangeWithoutPassword } = exchange;

        return {
            exchange: exchangeWithoutPassword,
            token,
        };
    }

    async getProfile(exchangeId) {
        const exchange = await this.exchangeRepository.findById(exchangeId);
        if (!exchange) {
            throw new AuthenticationError('Exchange not found');
        }

        const { password: _, ...exchangeWithoutPassword } = exchange;
        return exchangeWithoutPassword;
    }

    _generateToken(exchangeId) {
        return jwt.sign(
            { exchangeId },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );
    }
}

module.exports = AuthService;
