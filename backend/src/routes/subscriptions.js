/**
 * Subscription Routes
 * Compra de suscripciones vía x402
 */

const express = require('express');
const router = express.Router();
const x402Service = require('../services/x402Facilitator');
const subscriptionService = require('../services/subscriptionService');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/subscriptions/purchase
 * Comprar suscripción (protegido con x402)
 * Ejemplo: 1,000 USDC = 10 consultas
 */
router.post('/purchase', async (req, res) => {
  try {
    const { credits } = req.body;

    if (!credits || credits < subscriptionService.PRICING.MIN_PURCHASE_CREDITS) {
      return res.status(400).json({
        error: `Minimum purchase is ${subscriptionService.PRICING.MIN_PURCHASE_CREDITS} credits`,
      });
    }

    // Calcular precio
    const amount = subscriptionService.calculatePrice(credits);
    const price = `$${amount}`;

    // Verificar pago x402
    const paymentHeader = req.headers['x-payment'];
    const resourceUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const method = req.method;

    const paymentResult = await x402Service.verifyX402Payment(
      resourceUrl,
      method,
      paymentHeader,
      price
    );

    if (paymentResult.status === 402) {
      // Payment required - devolver 402 con información de pago
      return res.status(402).json({
        amount: amount.toString(),
        currency: 'USDC',
        network: 'avalanche-fuji',
        description: `Purchase ${credits} credits for user database access`,
        credits: credits,
        pricePerCredit: subscriptionService.PRICING.USDC_PER_CREDIT,
      });
    }

    if (paymentResult.status !== 200) {
      return res.status(paymentResult.status).json(
        paymentResult.responseBody || { error: 'Payment verification failed' }
      );
    }

    // Pago verificado - obtener exchange del token JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Exchange authentication required' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'myscorepass-jwt-secret-change-in-production';
    const token = authHeader.substring(7);
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const exchangeId = decoded.exchangeId;
    if (!exchangeId) {
      return res.status(401).json({ error: 'Exchange authentication required' });
    }

    // Registrar compra
    const purchase = subscriptionService.recordPurchase(
      exchangeId,
      amount,
      credits,
      paymentHeader || 'x402-payment'
    );

    res.json({
      success: true,
      purchase,
      creditsAdded: credits,
      newBalance: purchase.credits,
    });
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    res.status(500).json({ error: 'Failed to process purchase', details: error.message });
  }
});

/**
 * GET /api/subscriptions/balance
 * Obtener saldo y créditos del exchange autenticado
 */
router.get('/balance', requireAuth, (req, res) => {
  try {
    const exchange = req.exchange;

    res.json({
      success: true,
      credits: exchange.credits,
      totalPurchased: exchange.totalPurchased,
      totalConsumed: exchange.totalConsumed,
      pricing: {
        usdcPerCredit: subscriptionService.PRICING.USDC_PER_CREDIT,
        minPurchase: subscriptionService.PRICING.MIN_PURCHASE_CREDITS,
      },
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

/**
 * GET /api/subscriptions/usage
 * Obtener historial de uso del exchange autenticado
 */
router.get('/usage', requireAuth, (req, res) => {
  try {
    const exchange = req.exchange;
    const history = subscriptionService.getExchangeHistory(exchange.id);

    res.json({
      success: true,
      history,
      total: history.length,
    });
  } catch (error) {
    console.error('Error getting usage history:', error);
    res.status(500).json({ error: 'Failed to get usage history' });
  }
});

module.exports = router;
