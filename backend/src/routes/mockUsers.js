/**
 * Mock Users Routes
 * Endpoints para que exchanges consulten usuarios mockeados
 * - /search: Búsqueda sin consumir créditos (solo muestra nombre y DNI)
 * - /:id: Ver detalles completos (consume 1 crédito)
 */

const express = require('express');
const router = express.Router();
const MockUser = require('../models/MockUser');
const Exchange = require('../models/Exchange');
const subscriptionService = require('../services/subscriptionService');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/mockUsers/search
 * Buscar usuarios mockeados SIN consumir créditos (solo búsqueda)
 */
router.get('/search', requireAuth, async (req, res) => {
  try {
    // Obtener parámetros de búsqueda (solo si tienen valor)
    const minScore = req.query.minScore && req.query.minScore !== '' ? parseInt(req.query.minScore) : null;
    const maxScore = req.query.maxScore && req.query.maxScore !== '' ? parseInt(req.query.maxScore) : null;
    const verificationLevel = req.query.verificationLevel && req.query.verificationLevel !== '' ? parseInt(req.query.verificationLevel) : null;
    const name = req.query.name && req.query.name.trim() !== '' ? req.query.name.trim() : null;

    // Buscar usuarios con filtros (SIN consumir créditos)
    console.log('Búsqueda con filtros recibidos:', { 
      minScore: minScore, 
      maxScore: maxScore, 
      verificationLevel: verificationLevel, 
      name: name,
      minScoreType: typeof minScore,
      maxScoreType: typeof maxScore,
    });
    let users = MockUser.search({
      minScore,
      maxScore,
      verificationLevel,
      name,
    });
    console.log('Usuarios encontrados después de búsqueda:', users.length);

    // Retornar solo información básica (nombre y DNI)
    const basicUsers = users.map(user => ({
      id: user.id,
      name: user.identity.name,
      dni: user.identity.dni,
    }));

    console.log('Usuarios básicos retornados:', basicUsers.length);

    res.json({
      success: true,
      users: basicUsers,
      total: basicUsers.length,
    });
  } catch (error) {
    console.error('Error searching mock users:', error);
    res.status(500).json({ error: 'Failed to search users', details: error.message });
  }
});

/**
 * GET /api/mockUsers
 * Listar usuarios mockeados (DEPRECATED - usar /search en su lugar)
 * Mantenido por compatibilidad pero ya no consume créditos
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    // Obtener parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const minScore = req.query.minScore ? parseInt(req.query.minScore) : null;
    const maxScore = req.query.maxScore ? parseInt(req.query.maxScore) : null;
    const verificationLevel = req.query.verificationLevel ? parseInt(req.query.verificationLevel) : null;
    const name = req.query.name || null;

    // Buscar usuarios con filtros (SIN consumir créditos)
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

    // Retornar solo información básica (nombre y DNI)
    const basicUsers = users.map(user => ({
      id: user.id,
      name: user.identity.name,
      dni: user.identity.dni,
    }));

    res.json({
      success: true,
      users: basicUsers,
      total: basicUsers.length,
    });
  } catch (error) {
    console.error('Error listing mock users:', error);
    res.status(500).json({ error: 'Failed to list users', details: error.message });
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

/**
 * GET /api/mockUsers/:id
 * Obtener detalle de un usuario mockeado (consume 1 crédito)
 * IMPORTANTE: Esta ruta debe ir DESPUÉS de /search y /stats para evitar conflictos
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
    console.log('Buscando usuario con ID:', userId);
    
    const user = MockUser.findById(userId);
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      console.error('Usuario no encontrado con ID:', userId);
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

module.exports = router;
