/**
 * SBT Controller
 * Handles HTTP requests for SBT operations
 */

const { asyncHandler } = require('../middlewares/errorHandler');
const SBTService = require('../../core/services/SBTService');

const sbtService = new SBTService();

// Initialize service on first use
let initialized = false;
async function ensureInitialized() {
    if (!initialized) {
        await sbtService.initialize();
        initialized = true;
    }
}

/**
 * Mint SBT for a user
 * POST /api/sbt/mint
 * Body: { walletAddress, score, verificationLevel, scoreData }
 */
const mintSBT = asyncHandler(async (req, res) => {
    await ensureInitialized();

    const { walletAddress, score, verificationLevel, scoreData } = req.body;

    if (!walletAddress || score === undefined || verificationLevel === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: walletAddress, score, verificationLevel'
        });
    }

    const result = await sbtService.mintSBT(
        walletAddress,
        score,
        verificationLevel,
        scoreData
    );

    res.json({
        success: true,
        data: result
    });
});

/**
 * Get user's SBT
 * GET /api/sbt/:address
 */
const getUserSBT = asyncHandler(async (req, res) => {
    await ensureInitialized();

    const { address } = req.params;

    const sbtData = await sbtService.getUserSBT(address);

    if (!sbtData) {
        return res.status(404).json({
            success: false,
            error: 'User does not have an active SBT'
        });
    }

    res.json({
        success: true,
        data: sbtData
    });
});

/**
 * Verify user's SBT
 * GET /api/sbt/:address/verify?minLevel=1
 */
const verifySBT = asyncHandler(async (req, res) => {
    await ensureInitialized();

    const { address } = req.params;
    const minLevel = parseInt(req.query.minLevel) || 1;

    const isVerified = await sbtService.verifySBT(address, minLevel);

    res.json({
        success: true,
        data: {
            address,
            isVerified,
            minVerificationLevel: minLevel
        }
    });
});

/**
 * Check if user has active SBT
 * GET /api/sbt/:address/has-sbt
 */
const hasActiveSBT = asyncHandler(async (req, res) => {
    await ensureInitialized();

    const { address } = req.params;

    const hasActive = await sbtService.hasActiveSBT(address);

    res.json({
        success: true,
        data: {
            address,
            hasActiveSBT: hasActive
        }
    });
});

/**
 * Get SBT metadata by token ID
 * GET /api/sbt/token/:tokenId
 */
const getSBTMetadata = asyncHandler(async (req, res) => {
    await ensureInitialized();

    const { tokenId } = req.params;

    const metadata = await sbtService.getSBTMetadata(parseInt(tokenId));

    res.json({
        success: true,
        data: metadata
    });
});

/**
 * Get total supply of SBTs
 * GET /api/sbt/stats/total-supply
 */
const getTotalSupply = asyncHandler(async (req, res) => {
    await ensureInitialized();

    const totalSupply = await sbtService.getTotalSupply();

    res.json({
        success: true,
        data: {
            totalSupply
        }
    });
});

module.exports = {
    mintSBT,
    getUserSBT,
    verifySBT,
    hasActiveSBT,
    getSBTMetadata,
    getTotalSupply
};
