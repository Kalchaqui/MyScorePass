/**
 * Mock Users Routes
 * Endpoints para que exchanges consulten usuarios mockeados
 * Cada consulta consume 1 crédito
 */

const express = require('express');
const router = express.Router();
const MockUser = require('../models/MockUser');
const Exchange = require('../models/Exchange');
const subscriptionService = require('../services/subscriptionService');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/mockUsers
 * Listar usuarios mockeados (consume 1 crédito)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const exchange = req.exchange;

    // Verificar que tenga créditos
    if (exchange.credits < 1) {
      return res.status(402).json({
        error: 'Insufficient credits',
        creditsRequired: 1,
        currentCredits: exchange.credits,
        message: 'Please purchase more credits to access the user database',
      });
    }

    // Obtener parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const minScore = req.query.minScore ? parseInt(req.query.minScore) : null;
    const maxScore = req.query.maxScore ? parseInt(req.query.maxScore) : null;
    const verificationLevel = req.query.verificationLevel ? parseInt(req.query.verificationLevel) : null;
    const name = req.query.name || null;

    // Buscar usuarios con filtros
    let users;
    if (minScore || maxScore || verificationLevel || name) {
      users = MockUser.search({
        minScore,
        maxScore,
        verificationLevel,
        name,
      });
    } else {
      const paginated = MockUser.getPaginated(page, limit);
      users = paginated.users;
    }

    // Consumir 1 crédito
    Exchange.consumeCredits(exchange.id, 1);
    subscriptionService.recordConsumption(exchange.id, 1, 'list_users');

    // Obtener exchange actualizado
    const updatedExchange = Exchange.findById(exchange.id);

    res.json({
      success: true,
      users,
      creditsRemaining: updatedExchange.credits,
      consumed: 1,
    });
  } catch (error) {
    console.error('Error listing mock users:', error);
    res.status(500).json({ error: 'Failed to list users', details: error.message });
  }
});

/**
 * GET /api/mockUsers/:id
 * Obtener detalle de un usuario mockeado (consume 1 crédito)
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const exchange = req.exchange;

    // Verificar que tenga créditos
    if (exchange.credits < 1) {
      return res.status(402).json({
        error: 'Insufficient credits',
        creditsRequired: 1,
        currentCredits: exchange.credits,
        message: 'Please purchase more credits to access user details',
      });
    }

    const userId = parseInt(req.params.id);
    const user = MockUser.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Consumir 1 crédito
    Exchange.consumeCredits(exchange.id, 1);
    subscriptionService.recordConsumption(exchange.id, 1, 'get_user');

    // Obtener exchange actualizado
    const updatedExchange = Exchange.findById(exchange.id);

    res.json({
      success: true,
      user,
      creditsRemaining: updatedExchange.credits,
      consumed: 1,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user', details: error.message });
  }
});

/**
 * GET /api/mockUsers/stats
 * Obtener estadísticas de la base de datos (no consume créditos)
 */
router.get('/stats', requireAuth, (req, res) => {
  try {
    const users = MockUser.getAllMockUsers();
    
    const stats = {
      totalUsers: users.length,
      averageScore: users.length > 0 
        ? Math.round(users.reduce((sum, u) => sum + u.score, 0) / users.length)
        : 0,
      scoreRange: {
        min: users.length > 0 ? Math.min(...users.map(u => u.score)) : 0,
        max: users.length > 0 ? Math.max(...users.map(u => u.score)) : 0,
      },
      verificationLevels: {
        0: users.filter(u => u.identity.verificationLevel === 0).length,
        1: users.filter(u => u.identity.verificationLevel === 1).length,
        2: users.filter(u => u.identity.verificationLevel === 2).length,
        3: users.filter(u => u.identity.verificationLevel === 3).length,
      },
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
