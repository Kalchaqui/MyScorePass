/**
 * Exchange Repository
 * Data access layer for Exchange entities
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../../shared/config');
const { NotFoundError } = require('../../shared/errors');

class ExchangeRepository {
    constructor() {
        this.dataFile = path.join(config.dataDir, 'users.json');
    }

    async _readData() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // If file doesn't exist, return empty array
            return [];
        }
    }

    async _writeData(data) {
        await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
    }

    async findAll() {
        return await this._readData();
    }

    async findById(id) {
        const exchanges = await this._readData();
        return exchanges.find(ex => ex.id === id);
    }

    async findByEmail(email) {
        const exchanges = await this._readData();
        return exchanges.find(ex => ex.email === email);
    }

    async create(exchangeData) {
        const exchanges = await this._readData();

        const newExchange = {
            id: Date.now().toString(),
            ...exchangeData,
            credits: 0,
            totalPurchased: 0,
            totalConsumed: 0,
            createdAt: new Date().toISOString(),
        };

        exchanges.push(newExchange);
        await this._writeData(exchanges);

        return newExchange;
    }

    async update(id, updates) {
        const exchanges = await this._readData();
        const index = exchanges.findIndex(ex => ex.id === id);

        if (index === -1) {
            throw new NotFoundError('Exchange not found');
        }

        exchanges[index] = {
            ...exchanges[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        await this._writeData(exchanges);
        return exchanges[index];
    }

    async delete(id) {
        const exchanges = await this._readData();
        const filtered = exchanges.filter(ex => ex.id !== id);

        if (filtered.length === exchanges.length) {
            throw new NotFoundError('Exchange not found');
        }

        await this._writeData(filtered);
    }

    async addCredits(id, amount) {
        const exchange = await this.findById(id);
        if (!exchange) {
            throw new NotFoundError('Exchange not found');
        }

        return await this.update(id, {
            credits: exchange.credits + amount,
            totalPurchased: exchange.totalPurchased + amount,
        });
    }

    async consumeCredits(id, amount) {
        const exchange = await this.findById(id);
        if (!exchange) {
            throw new NotFoundError('Exchange not found');
        }

        return await this.update(id, {
            credits: exchange.credits - amount,
            totalConsumed: exchange.totalConsumed + amount,
        });
    }
}

module.exports = ExchangeRepository;
