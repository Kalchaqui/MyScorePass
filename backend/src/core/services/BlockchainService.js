/**
 * Blockchain Service Base
 * Provides common blockchain interaction utilities
 */

const { ethers } = require('ethers');
const config = require('../../shared/config');
const logger = require('../../shared/logger');

class BlockchainService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.initialized = false;
    }

    /**
     * Initialize blockchain connection
     */
    async initialize() {
        try {
            // Create provider
            this.provider = new ethers.JsonRpcProvider(config.avalancheRpcUrl);

            // Create signer if private key is available
            if (config.blockchainPrivateKey) {
                this.signer = new ethers.Wallet(config.blockchainPrivateKey, this.provider);
                logger.info('Blockchain service initialized with signer', {
                    address: this.signer.address,
                    network: config.avalancheRpcUrl
                });
            } else {
                logger.warn('Blockchain service initialized without signer (read-only mode)');
            }

            this.initialized = true;
            return true;
        } catch (error) {
            logger.error('Failed to initialize blockchain service', { error: error.message });
            throw error;
        }
    }

    /**
     * Get contract instance
     */
    getContract(address, abi) {
        if (!this.initialized) {
            throw new Error('Blockchain service not initialized');
        }

        // Use signer if available, otherwise use provider (read-only)
        const signerOrProvider = this.signer || this.provider;
        return new ethers.Contract(address, abi, signerOrProvider);
    }

    /**
     * Check if service has write access (signer available)
     */
    hasWriteAccess() {
        return this.signer !== null;
    }

    /**
     * Get current gas price
     */
    async getGasPrice() {
        const feeData = await this.provider.getFeeData();
        return feeData.gasPrice;
    }

    /**
     * Estimate gas for transaction
     */
    async estimateGas(contract, method, args) {
        try {
            const gasEstimate = await contract[method].estimateGas(...args);
            return gasEstimate;
        } catch (error) {
            logger.error('Gas estimation failed', { method, error: error.message });
            throw error;
        }
    }

    /**
     * Wait for transaction confirmation
     */
    async waitForTransaction(txHash, confirmations = 1) {
        logger.info('Waiting for transaction', { txHash, confirmations });
        const receipt = await this.provider.waitForTransaction(txHash, confirmations);
        logger.info('Transaction confirmed', {
            txHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });
        return receipt;
    }

    /**
     * Get transaction receipt
     */
    async getTransactionReceipt(txHash) {
        return await this.provider.getTransactionReceipt(txHash);
    }

    /**
     * Get block number
     */
    async getBlockNumber() {
        return await this.provider.getBlockNumber();
    }

    /**
     * Format address (checksum)
     */
    formatAddress(address) {
        return ethers.getAddress(address);
    }

    /**
     * Validate address
     */
    isValidAddress(address) {
        return ethers.isAddress(address);
    }
}

module.exports = BlockchainService;
