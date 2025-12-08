/**
 * API Routes Configuration
 * Defines all API endpoints
 */

const express = require('express');
const authController = require('../controllers/authController');
const subscriptionController = require('../controllers/subscriptionController');
const mockUserController = require('../controllers/mockUserController');
const exchangeController = require('../controllers/exchangeController');
const sbtController = require('../controllers/sbtController');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

// Auth routes (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', requireAuth, authController.getProfile);

// Subscription routes (protected)
router.post('/subscriptions/purchase', requireAuth, subscriptionController.purchaseCredits);
router.get('/subscriptions/balance', requireAuth, subscriptionController.getBalance);
router.get('/subscriptions/usage', requireAuth, subscriptionController.getUsage);

// MockUser routes (protected)
router.get('/mockUsers', requireAuth, mockUserController.queryUsers);
router.get('/mockUsers/stats', requireAuth, mockUserController.getStats);
router.get('/mockUsers/:id', requireAuth, mockUserController.getUserById);

// Exchange routes (protected)
router.get('/exchanges/me', requireAuth, exchangeController.getMe);
router.put('/exchanges/me', requireAuth, exchangeController.updateMe);

// SBT Routes (Blockchain)
router.post('/sbt/mint', requireAuth, sbtController.mintSBT); // Mint SBT for user
router.get('/sbt/:address', sbtController.getUserSBT); // Get user's SBT (public)
router.get('/sbt/:address/verify', sbtController.verifySBT); // Verify SBT (public)
router.get('/sbt/:address/has-sbt', sbtController.hasActiveSBT); // Check if has SBT (public)
router.get('/sbt/token/:tokenId', sbtController.getSBTMetadata); // Get metadata by token ID (public)
router.get('/sbt/stats/total-supply', sbtController.getTotalSupply); // Get total supply (public)

module.exports = router;
