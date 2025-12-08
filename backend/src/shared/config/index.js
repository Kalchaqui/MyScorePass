/**
 * Configuration Management
 * Centralized access to environment variables with validation
 */

require('dotenv').config();

const config = {
    // Server
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Security
    jwtSecret: process.env.JWT_SECRET || 'myscorepass-jwt-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // x402
    x402Mode: process.env.X402_MODE || 'simulated', // 'simulated' or 'production'
    thirdwebSecretKey: process.env.THIRDWEB_SECRET_KEY,
    thirdwebServerWallet: process.env.THIRDWEB_SERVER_WALLET_ADDRESS,
    merchantWallet: process.env.MERCHANT_WALLET_ADDRESS || '0x5d7282E3fe75956E2E1a1625a17c26e9766662FA',

    // Blockchain
    avalancheRpcUrl: process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: process.env.CHAIN_ID || 43113,
    blockchainPrivateKey: process.env.BLOCKCHAIN_PRIVATE_KEY, // Optional: for write operations

    // Smart Contract Addresses (will be set after deployment)
    sbtContractAddress: process.env.SBT_CONTRACT_ADDRESS,
    identityRegistryAddress: process.env.IDENTITY_REGISTRY_ADDRESS,
    creditScoringAddress: process.env.CREDIT_SCORING_ADDRESS,

    // Business Logic
    pricing: {
        usdcPerCredit: 100,
        minPurchaseCredits: 10,
    },

    // Paths
    uploadsDir: process.env.UPLOADS_DIR || './uploads',
    dataDir: process.env.DATA_DIR || './data',
};

// Validation
function validateConfig() {
    const errors = [];

    if (!config.jwtSecret || config.jwtSecret === 'myscorepass-jwt-secret-change-in-production') {
        if (config.nodeEnv === 'production') {
            errors.push('JWT_SECRET must be set in production');
        }
    }

    if (config.x402Mode === 'production') {
        if (!config.thirdwebSecretKey) {
            errors.push('THIRDWEB_SECRET_KEY required for production x402 mode');
        }
        if (!config.thirdwebServerWallet) {
            errors.push('THIRDWEB_SERVER_WALLET_ADDRESS required for production x402 mode');
        }
    }

    if (errors.length > 0) {
        console.error('Configuration errors:');
        errors.forEach(err => console.error(`  - ${err}`));
        process.exit(1);
    }
}

// Validate on load
validateConfig();

module.exports = config;
