/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */

const { asyncHandler } = require('../middlewares/errorHandler');
const AuthService = require('../../core/services/AuthService');

const authService = new AuthService();

const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json({
        success: true,
        data: result,
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
        success: true,
        data: result,
    });
});

const getProfile = asyncHandler(async (req, res) => {
    const exchange = await authService.getProfile(req.exchangeId);

    res.json({
        success: true,
        data: exchange,
    });
});

module.exports = {
    register,
    login,
    getProfile,
};
