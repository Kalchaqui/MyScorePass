/**
 * Exchange Routes
 * Gestión de información de exchanges
 */

const express = require('express');
const router = express.Router();
const Exchange = require('../models/Exchange');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/exchanges/me
 * Obtener información del exchange autenticado
 */
router.get('/me', requireAuth, (req, res) => {
  try {
    const exchange = req.exchange;
    
    // Remover password
    const { password: _, ...exchangeWithoutPassword } = exchange;

    res.json({
      success: true,
      exchange: exchangeWithoutPassword,
    });
  } catch (error) {
    console.error('Error getting exchange info:', error);
    res.status(500).json({ error: 'Failed to get exchange info' });
  }
});

/**
 * PUT /api/exchanges/me
 * Actualizar información del exchange autenticado
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    const exchange = req.exchange;
    const { name, walletAddress } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (walletAddress) updateData.walletAddress = walletAddress;

    const updated = Exchange.update(exchange.id, updateData);

    // Remover password
    const { password: _, ...exchangeWithoutPassword } = updated;

    res.json({
      success: true,
      exchange: exchangeWithoutPassword,
    });
  } catch (error) {
    console.error('Error updating exchange:', error);
    res.status(500).json({ error: 'Failed to update exchange' });
  }
});

module.exports = router;
