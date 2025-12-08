/**
 * MockUser Repository
 * Data access layer for MockUser entities
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../../shared/config');

class MockUserRepository {
    constructor() {
        this.dataFile = path.join(config.dataDir, 'mockUsers.json');
    }

    async _readData() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async findAll(filters = {}) {
        const users = await this._readData();

        let filtered = users;

        // Apply filters
        if (filters.minScore !== undefined) {
            filtered = filtered.filter(u => u.score >= filters.minScore);
        }

        if (filters.maxScore !== undefined) {
            filtered = filtered.filter(u => u.score <= filters.maxScore);
        }

        if (filters.verificationLevel !== undefined) {
            filtered = filtered.filter(u => u.verificationLevel === filters.verificationLevel);
        }

        if (filters.name) {
            const searchName = filters.name.toLowerCase();
            filtered = filtered.filter(u =>
                u.identity.name.toLowerCase().includes(searchName)
            );
        }

        return filtered;
    }

    async findById(id) {
        const users = await this._readData();
        return users.find(u => u.id === id);
    }

    async findByWallet(walletAddress) {
        const users = await this._readData();
        return users.find(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    }

    async count() {
        const users = await this._readData();
        return users.length;
    }

    async getStats() {
        const users = await this._readData();

        const scores = users.map(u => u.score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);

        const verificationLevels = users.reduce((acc, u) => {
            acc[u.verificationLevel] = (acc[u.verificationLevel] || 0) + 1;
            return acc;
        }, {});

        return {
            total: users.length,
            avgScore: Math.round(avgScore),
            minScore,
            maxScore,
            verificationLevels,
        };
    }
}

module.exports = MockUserRepository;
