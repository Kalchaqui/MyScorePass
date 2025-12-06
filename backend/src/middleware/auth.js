/**
 * Authentication Middleware
 * Verifica que el exchange esté autenticado usando JWT
 */

const jwt = require('jsonwebtoken');
const Exchange = require('../models/Exchange');

const JWT_SECRET = process.env.JWT_SECRET || 'myscorepass-jwt-secret-change-in-production';

/**
 * Middleware para verificar autenticación
 */
function requireAuth(req, res, next) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar exchange
    const exchange = Exchange.findById(decoded.exchangeId);
    if (!exchange) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Agregar exchange al request
    req.exchange = exchange;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Middleware opcional (no requiere autenticación pero agrega exchange si existe)
 */
function optionalAuth(req, res, next) {
  const exchangeId = req.session?.exchangeId || req.headers['x-exchange-id'];
  
  if (exchangeId) {
    const exchange = Exchange.findById(exchangeId);
    if (exchange) {
      req.exchange = exchange;
    }
  }
  
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
};
