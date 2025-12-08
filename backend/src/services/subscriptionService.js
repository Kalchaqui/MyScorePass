/**
 * Subscription Service
 * Gestión de suscripciones y créditos de exchanges
 */

const Exchange = require('../models/Exchange');
const fs = require('fs');
const path = require('path');

const SUBSCRIPTION_HISTORY_FILE = path.join(__dirname, '../../data/subscriptionHistory.json');

/**
 * Obtener historial de suscripciones
 */
function getSubscriptionHistory() {
  if (!fs.existsSync(SUBSCRIPTION_HISTORY_FILE)) {
    fs.mkdirSync(path.dirname(SUBSCRIPTION_HISTORY_FILE), { recursive: true });
    fs.writeFileSync(SUBSCRIPTION_HISTORY_FILE, JSON.stringify([]));
    return [];
  }
  return JSON.parse(fs.readFileSync(SUBSCRIPTION_HISTORY_FILE, 'utf8'));
}

/**
 * Guardar historial de suscripciones
 */
function saveSubscriptionHistory(history) {
  fs.mkdirSync(path.dirname(SUBSCRIPTION_HISTORY_FILE), { recursive: true });
  fs.writeFileSync(SUBSCRIPTION_HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Registrar compra de suscripción
 */
function recordPurchase(exchangeId, amount, credits, paymentTxHash) {
  const history = getSubscriptionHistory();
  
  const purchase = {
    id: history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1,
    exchangeId,
    amount,
    credits,
    paymentTxHash,
    timestamp: new Date().toISOString(),
  };

  history.push(purchase);
  saveSubscriptionHistory(history);

  // Agregar créditos al exchange
  Exchange.addCredits(exchangeId, credits);

  return purchase;
}

/**
 * Registrar consumo de créditos
 */
function recordConsumption(exchangeId, credits, action) {
  const history = getSubscriptionHistory();
  
  const consumption = {
    id: history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1,
    exchangeId,
    type: 'consumption',
    credits,
    action, // 'list_users', 'get_user', etc.
    timestamp: new Date().toISOString(),
  };

  history.push(consumption);
  saveSubscriptionHistory(history);

  return consumption;
}

/**
 * Obtener historial de un exchange
 */
function getExchangeHistory(exchangeId) {
  const history = getSubscriptionHistory();
  return history.filter(h => h.exchangeId === exchangeId);
}

/**
 * Configuración de precios
 * 0.2 USDC = 10 consultas (0.02 USDC por crédito)
 */
const PRICING = {
  USDC_PER_CREDIT: 0.02, // 0.2 USDC / 10 créditos = 0.02 USDC por crédito
  MIN_PURCHASE_CREDITS: 10, // Mínimo 10 créditos
};

/**
 * Calcular precio para una cantidad de créditos
 */
function calculatePrice(credits) {
  if (credits < PRICING.MIN_PURCHASE_CREDITS) {
    throw new Error(`Minimum purchase is ${PRICING.MIN_PURCHASE_CREDITS} credits`);
  }
  return credits * PRICING.USDC_PER_CREDIT;
}

/**
 * Calcular créditos para un monto
 */
function calculateCredits(amount) {
  return Math.floor(amount / PRICING.USDC_PER_CREDIT);
}

module.exports = {
  recordPurchase,
  recordConsumption,
  getExchangeHistory,
  calculatePrice,
  calculateCredits,
  PRICING,
};
