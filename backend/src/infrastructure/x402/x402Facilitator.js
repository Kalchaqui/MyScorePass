/**
 * x402 Facilitator Service
 * Integración real con Thirdweb x402 para verificar pagos
 */

const { createThirdwebClient } = require('thirdweb');
const { facilitator, settlePayment } = require('thirdweb/x402');
const { defineChain } = require('thirdweb/chains');

// Avalanche Fuji Testnet
const avalancheFuji = defineChain(43113);

let thirdwebClient = null;
let x402Facilitator = null;

/**
 * Inicializar cliente y facilitator de Thirdweb
 */
function initializeX402() {
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  const serverWalletAddress = process.env.THIRDWEB_SERVER_WALLET_ADDRESS || process.env.MERCHANT_WALLET_ADDRESS;

  if (!secretKey) {
    console.warn('⚠️  THIRDWEB_SECRET_KEY no configurado, x402 usará modo simulado');
    return null;
  }

  if (!serverWalletAddress) {
    console.warn('⚠️  THIRDWEB_SERVER_WALLET_ADDRESS no configurado, x402 usará modo simulado');
    return null;
  }

  try {
    // Crear cliente de Thirdweb
    thirdwebClient = createThirdwebClient({
      secretKey: secretKey,
    });

    // Crear facilitator
    x402Facilitator = facilitator({
      client: thirdwebClient,
      serverWalletAddress: serverWalletAddress,
    });

    console.log('✅ x402 Facilitator inicializado correctamente');
    return x402Facilitator;
  } catch (error) {
    console.error('❌ Error inicializando x402 Facilitator:', error);
    return null;
  }
}

/**
 * Verificar pago x402
 * @param {string} resourceUrl - URL del recurso solicitado
 * @param {string} method - Método HTTP (GET, POST, etc.)
 * @param {string} paymentData - Header X-Payment del request
 * @param {string} price - Precio en formato "$0.50"
 * @returns {Promise<{status: number, responseBody?: any, responseHeaders?: any}>}
 */
async function verifyX402Payment(resourceUrl, method, paymentData, price) {
  // Si no hay facilitator configurado, usar modo simulado
  if (!x402Facilitator) {
    if (paymentData) {
      // Si hay header X-Payment, asumir que el pago está simulado y es válido
      return { status: 200 };
    } else {
      // Si no hay header, devolver 402
      return {
        status: 402,
        responseBody: {
          amount: price.replace('$', ''),
          currency: 'USDC',
          network: 'avalanche-fuji',
          description: 'Payment required',
        },
        responseHeaders: {
          'Content-Type': 'application/json',
        },
      };
    }
  }

  try {
    // Verificar pago real con Thirdweb facilitator
    const result = await settlePayment({
      resourceUrl: resourceUrl,
      method: method,
      paymentData: paymentData,
      network: avalancheFuji,
      price: price,
      facilitator: x402Facilitator,
    });

    return {
      status: result.status,
      responseBody: result.responseBody,
      responseHeaders: result.responseHeaders,
    };
  } catch (error) {
    console.error('Error verificando pago x402:', error);
    // En caso de error, devolver 402 para que el cliente intente pagar
    return {
      status: 402,
      responseBody: {
        amount: price.replace('$', ''),
        currency: 'USDC',
        network: 'avalanche-fuji',
        description: 'Payment verification failed',
        error: error.message,
      },
      responseHeaders: {
        'Content-Type': 'application/json',
      },
    };
  }
}

// Inicializar al cargar el módulo
initializeX402();

module.exports = {
  verifyX402Payment,
  initializeX402,
};

