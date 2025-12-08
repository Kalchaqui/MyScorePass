/**
 * Exchange Model
 * Representa un cliente B2B (exchange, banco, etc.)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const EXCHANGES_FILE = path.join(__dirname, '../../data/exchanges.json');

/**
 * Obtener todos los exchanges
 */
function getAllExchanges() {
  if (!fs.existsSync(EXCHANGES_FILE)) {
    fs.mkdirSync(path.dirname(EXCHANGES_FILE), { recursive: true });
    fs.writeFileSync(EXCHANGES_FILE, JSON.stringify([]));
    return [];
  }
  return JSON.parse(fs.readFileSync(EXCHANGES_FILE, 'utf8'));
}

/**
 * Guardar exchanges
 */
function saveExchanges(exchanges) {
  fs.mkdirSync(path.dirname(EXCHANGES_FILE), { recursive: true });
  fs.writeFileSync(EXCHANGES_FILE, JSON.stringify(exchanges, null, 2));
}

/**
 * Buscar exchange por email
 */
function findByEmail(email) {
  const exchanges = getAllExchanges();
  return exchanges.find(e => e.email.toLowerCase() === email.toLowerCase());
}

/**
 * Buscar exchange por Privy User ID
 */
function findByPrivyUserId(privyUserId) {
  const exchanges = getAllExchanges();
  return exchanges.find(e => e.privyUserId === privyUserId);
}

/**
 * Buscar exchange por ID
 */
function findById(id) {
  const exchanges = getAllExchanges();
  return exchanges.find(e => e.id === parseInt(id));
}

/**
 * Crear nuevo exchange
 */
function create(exchangeData) {
  const exchanges = getAllExchanges();
  
  // Verificar que el email no exista
  if (findByEmail(exchangeData.email)) {
    throw new Error('Email already registered');
  }

  const newExchange = {
    id: exchanges.length > 0 ? Math.max(...exchanges.map(e => e.id)) + 1 : 1,
    email: exchangeData.email,
    password: exchangeData.password || null, // Puede ser null si viene de Privy
    name: exchangeData.name,
    walletAddress: exchangeData.walletAddress || null,
    privyUserId: exchangeData.privyUserId || null,
    credits: 0,
    totalPurchased: 0,
    totalConsumed: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  exchanges.push(newExchange);
  saveExchanges(exchanges);
  
  return newExchange;
}

/**
 * Actualizar exchange
 */
function update(id, updateData) {
  const exchanges = getAllExchanges();
  const index = exchanges.findIndex(e => e.id === parseInt(id));
  
  if (index === -1) {
    throw new Error('Exchange not found');
  }

  exchanges[index] = {
    ...exchanges[index],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  saveExchanges(exchanges);
  return exchanges[index];
}

/**
 * Agregar créditos a un exchange
 */
function addCredits(id, credits) {
  const exchange = findById(id);
  if (!exchange) {
    throw new Error('Exchange not found');
  }

  exchange.credits += credits;
  exchange.totalPurchased += credits;
  
  return update(id, {
    credits: exchange.credits,
    totalPurchased: exchange.totalPurchased,
  });
}

/**
 * Consumir créditos de un exchange
 */
function consumeCredits(id, credits = 1) {
  const exchange = findById(id);
  if (!exchange) {
    throw new Error('Exchange not found');
  }

  if (exchange.credits < credits) {
    throw new Error('Insufficient credits');
  }

  exchange.credits -= credits;
  exchange.totalConsumed += credits;

  return update(id, {
    credits: exchange.credits,
    totalConsumed: exchange.totalConsumed,
  });
}

module.exports = {
  getAllExchanges,
  findByEmail,
  findById,
  findByPrivyUserId,
  create,
  update,
  addCredits,
  consumeCredits,
};
