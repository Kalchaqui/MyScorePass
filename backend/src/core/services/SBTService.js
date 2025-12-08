/**
 * SBT Service
 * Handles interactions with MyScorePassSBT contract
 */

const BlockchainService = require('./BlockchainService');
const SBT_ABI = require('../../shared/contracts/MyScorePassSBT.abi');
const config = require('../../shared/config');
const logger = require('../../shared/logger');
const { ethers } = require('ethers');

class SBTService extends BlockchainService {
    constructor() {
        super();
        this.contract = null;
    }

    /**
     * Initialize SBT service
     */
    async initialize() {
        await super.initialize();

        if (!config.sbtContractAddress) {
            logger.warn('SBT contract address not configured');
            return false;
        }

        this.contract = this.getContract(config.sbtContractAddress, SBT_ABI);
        logger.info('SBT Service initialized', { address: config.sbtContractAddress });
        return true;
    }

    /**
     * Mint SBT for a user
     * @param {string} userAddress - User's wallet address
     * @param {number} score - Credit score (0-1000)
     * @param {number} verificationLevel - Verification level (0-3)
     * @param {object} scoreData - Additional score data to hash
     */
    async mintSBT(userAddress, score, verificationLevel, scoreData = {}) {
        if (!this.hasWriteAccess()) {
            throw new Error('Cannot mint SBT: No signer configured');
        }

        try {
            // Validate inputs
            if (!this.isValidAddress(userAddress)) {
                throw new Error('Invalid user address');
            }
            if (score < 0 || score > 1000) {
                throw new Error('Score must be between 0 and 1000');
            }
            if (verificationLevel < 0 || verificationLevel > 3) {
                throw new Error('Verification level must be between 0 and 3');
            }

            // Create score hash
            const scoreHash = ethers.keccak256(
                ethers.toUtf8Bytes(JSON.stringify({
                    score,
                    verificationLevel,
                    timestamp: Date.now(),
                    ...scoreData
                }))
            );

            logger.info('Minting SBT', {
                userAddress,
                score,
                verificationLevel,
                scoreHash
            });

            // Estimate gas
            const gasEstimate = await this.estimateGas(
                this.contract,
                'mintSBT',
                [userAddress, scoreHash, score, verificationLevel]
            );

            // Send transaction
            const tx = await this.contract.mintSBT(
                userAddress,
                scoreHash,
                score,
                verificationLevel,
                { gasLimit: gasEstimate * 120n / 100n } // 20% buffer
            );

            logger.info('SBT mint transaction sent', { txHash: tx.hash });

            // Wait for confirmation
            const receipt = await this.waitForTransaction(tx.hash);

            // Parse events to get token ID
            const mintEvent = receipt.logs
                .map(log => {
                    try {
                        return this.contract.interface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find(event => event && event.name === 'SBTMinted');

            const tokenId = mintEvent ? mintEvent.args.tokenId.toString() : null;

            return {
                success: true,
                txHash: tx.hash,
                tokenId,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            logger.error('Failed to mint SBT', {
                error: error.message,
                userAddress,
                score
            });
            throw error;
        }
    }

    /**
     * Get user's SBT data
     * @param {string} userAddress - User's wallet address
     */
    async getUserSBT(userAddress) {
        try {
            if (!this.isValidAddress(userAddress)) {
                throw new Error('Invalid user address');
            }

            // Check if user has SBT
            const hasActiveSBT = await this.contract.hasActiveSBT(userAddress);

            if (!hasActiveSBT) {
                return null;
            }

            // Get SBT data
            const sbtData = await this.contract.getUserSBT(userAddress);

            return {
                tokenId: sbtData.tokenId.toString(),
                scoreHash: sbtData.scoreHash,
                score: Number(sbtData.score),
                verificationLevel: Number(sbtData.verificationLevel),
                issuedAt: Number(sbtData.issuedAt),
                issuedAtDate: new Date(Number(sbtData.issuedAt) * 1000).toISOString()
            };
        } catch (error) {
            logger.error('Failed to get user SBT', {
                error: error.message,
                userAddress
            });
            throw error;
        }
    }

    /**
     * Verify if user has SBT with minimum verification level
     * @param {string} userAddress - User's wallet address
     * @param {number} minVerificationLevel - Minimum required level
     */
    async verifySBT(userAddress, minVerificationLevel = 1) {
        try {
            if (!this.isValidAddress(userAddress)) {
                throw new Error('Invalid user address');
            }

            const isVerified = await this.contract.verifySBT(
                userAddress,
                minVerificationLevel
            );

            return isVerified;
        } catch (error) {
            logger.error('Failed to verify SBT', {
                error: error.message,
                userAddress,
                minVerificationLevel
            });
            return false;
        }
    }

    /**
     * Get SBT metadata by token ID
     * @param {number} tokenId - Token ID
     */
    async getSBTMetadata(tokenId) {
        try {
            const metadata = await this.contract.getSBTMetadata(tokenId);

            return {
                scoreHash: metadata.scoreHash,
                score: Number(metadata.score),
                verificationLevel: Number(metadata.verificationLevel),
                issuedAt: Number(metadata.issuedAt),
                issuer: metadata.issuer,
                issuedAtDate: new Date(Number(metadata.issuedAt) * 1000).toISOString()
            };
        } catch (error) {
            logger.error('Failed to get SBT metadata', {
                error: error.message,
                tokenId
            });
            throw error;
        }
    }

    /**
     * Get total supply of SBTs
     */
    async getTotalSupply() {
        try {
            const total = await this.contract.totalSupply();
            return Number(total);
        } catch (error) {
            logger.error('Failed to get total supply', { error: error.message });
            throw error;
        }
    }

    /**
     * Check if user has active SBT
     * @param {string} userAddress - User's wallet address
     */
    async hasActiveSBT(userAddress) {
        try {
            if (!this.isValidAddress(userAddress)) {
                throw new Error('Invalid user address');
            }

            return await this.contract.hasActiveSBT(userAddress);
        } catch (error) {
            logger.error('Failed to check active SBT', {
                error: error.message,
                userAddress
            });
            return false;
        }
    }
}

module.exports = SBTService;
