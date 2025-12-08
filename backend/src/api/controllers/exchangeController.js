/**
 * Exchange Controller
 * Handles HTTP requests for exchange management
 */

const { asyncHandler } = require('../middlewares/errorHandler');
const ExchangeRepository = require('../../core/repositories/ExchangeRepository');

const exchangeRepository = new ExchangeRepository();

const getMe = asyncHandler(async (req, res) => {
    const exchange = await exchangeRepository.findById(req.exchangeId);
    const { password, ...exchangeWithoutPassword } = exchange;

    res.json({
        success: true,
        data: exchangeWithoutPassword,
    });
});

const updateMe = asyncHandler(async (req, res) => {
    const { name, walletAddress } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (walletAddress) updates.walletAddress = walletAddress;

    const exchange = await exchangeRepository.update(req.exchangeId, updates);
    const { password, ...exchangeWithoutPassword } = exchange;

    res.json({
        success: true,
        data: exchangeWithoutPassword,
    });
});

module.exports = {
    getMe,
    updateMe,
};
