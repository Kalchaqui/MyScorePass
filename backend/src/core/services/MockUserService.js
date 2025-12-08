/**
 * MockUser Service
 * Business logic for mock user queries
 */

const MockUserRepository = require('../repositories/MockUserRepository');
const { NotFoundError } = require('../../shared/errors');
const logger = require('../../shared/logger');

class MockUserService {
    constructor() {
        this.mockUserRepository = new MockUserRepository();
    }

    async queryUsers(filters = {}) {
        logger.info('Querying mock users', { filters });

        const users = await this.mockUserRepository.findAll(filters);

        return {
            users,
            count: users.length,
            filters,
        };
    }

    async getUserById(id) {
        const user = await this.mockUserRepository.findById(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    async getUserByWallet(walletAddress) {
        const user = await this.mockUserRepository.findByWallet(walletAddress);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    async getStats() {
        return await this.mockUserRepository.getStats();
    }
}

module.exports = MockUserService;
