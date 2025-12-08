/**
 * Authentication Routes
 * Login y registro de exchanges
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Exchange = require('../models/Exchange');
const { JWT_SECRET } = require('../config/jwt');

/**
 * POST /api/auth/register
 * Registrar nuevo exchange
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, walletAddress } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    // Verificar que el email no exista
    if (Exchange.findByEmail(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear exchange
    const exchange = Exchange.create({
      email,
      password: hashedPassword,
      name,
      walletAddress: walletAddress || null,
    });

    // Generar JWT token
    const token = jwt.sign(
      { exchangeId: exchange.id, email: exchange.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remover password de la respuesta
    const { password: _, ...exchangeWithoutPassword } = exchange;

    res.status(201).json({
      success: true,
      exchange: exchangeWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Error registering exchange:', error);
    res.status(500).json({ error: 'Failed to register exchange' });
  }
});

/**
 * POST /api/auth/login
 * Login de exchange
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Buscar exchange
    const exchange = Exchange.findByEmail(email);
    if (!exchange) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verificar password
    const validPassword = await bcrypt.compare(password, exchange.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generar JWT token
    const token = jwt.sign(
      { exchangeId: exchange.id, email: exchange.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remover password de la respuesta
    const { password: _, ...exchangeWithoutPassword } = exchange;

    res.json({
      success: true,
      exchange: exchangeWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * POST /api/auth/privy-login
 * Sincronizar usuario de Privy con backend JWT
 * Crea o obtiene el exchange basado en el privyUserId
 */
router.post('/privy-login', async (req, res) => {
  try {
    const { privyUserId, email, name } = req.body;

    if (!privyUserId || !email) {
      return res.status(400).json({ error: 'privyUserId and email are required' });
    }

    // Buscar exchange por Privy User ID
    let exchange = Exchange.findByPrivyUserId(privyUserId);

    // Si no existe, buscar por email
    if (!exchange) {
      exchange = Exchange.findByEmail(email);
    }

    // Si no existe, crear uno nuevo
    if (!exchange) {
      exchange = Exchange.create({
        email,
        name: name || email.split('@')[0],
        privyUserId,
        password: null, // No se usa con Privy
      });
    } else {
      // Si existe pero no tiene privyUserId, actualizarlo
      if (!exchange.privyUserId) {
        exchange = Exchange.update(exchange.id, { privyUserId });
      }
    }

    // Generar JWT token
    const token = jwt.sign(
      { exchangeId: exchange.id, email: exchange.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remover password de la respuesta
    const { password: _, ...exchangeWithoutPassword } = exchange;

    res.json({
      success: true,
      exchange: exchangeWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Error in privy-login:', error);
    res.status(500).json({ error: error.message || 'Failed to sync Privy user' });
  }
});

/**
 * GET /api/auth/me
 * Obtener información del exchange autenticado
 */
router.get('/me', (req, res) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const exchange = Exchange.findById(decoded.exchangeId);
    if (!exchange) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Remover password
    const { password: _, ...exchangeWithoutPassword } = exchange;

    res.json({
      success: true,
      exchange: exchangeWithoutPassword,
    });
  } catch (error) {
    console.error('Error getting exchange info:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
