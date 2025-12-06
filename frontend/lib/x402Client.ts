/**
 * x402 Client for MyScorePass
 * Handles payment flow automatically
 */

import { PAYMENT_AMOUNTS } from './x402';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; // Backend runs on 3001

/**
 * Calculate score with x402 payment
 * MVP: Simulates payment flow by retrying with X-Payment header
 */
export async function calculateScoreWithX402(walletAddress: string, simulatePayment: boolean = false): Promise<any> {
  try {
    const makeRequest = async (includePayment: boolean = false) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // En MVP, si simulatePayment es true, añadimos el header X-Payment
      if (includePayment || simulatePayment) {
        headers['X-Payment'] = 'simulated-payment-mvp';
      }

      return fetch(`${API_URL}/api/score/calculate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ walletAddress }),
      });
    };

    // Primera solicitud (sin pago)
    let response = await makeRequest(false);

    // Check if payment is required (HTTP 402)
    if (response.status === 402) {
      const paymentData = await response.json();
      
      // En MVP, si simulatePayment es true, reintentamos con el header de pago
      if (simulatePayment) {
        console.log('Simulando pago x402...');
        response = await makeRequest(true);
        
        if (response.status === 402) {
          // Si aún requiere pago, lanzar error con información
          throw new Error(`Payment required: ${paymentData.amount} ${paymentData.currency}. Payment simulation failed.`);
        }
      } else {
        // Si no se simula el pago, lanzar error con información de pago
        throw new Error(`PAYMENT_REQUIRED:${JSON.stringify(paymentData)}`);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calculating score:', error);
    throw error;
  }
}

/**
 * Query existing score
 */
export async function queryScoreWithX402(walletAddress: string, simulatePayment: boolean = false): Promise<any> {
  try {
    const makeRequest = async (includePayment: boolean = false) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (includePayment || simulatePayment) {
        headers['X-Payment'] = 'simulated-payment-mvp';
      }

      return fetch(
        `${API_URL}/api/score/query?walletAddress=${walletAddress}`,
        {
          method: 'GET',
          headers,
        }
      );
    };

    let response = await makeRequest(false);

    if (response.status === 402) {
      const paymentData = await response.json();
      
      if (simulatePayment) {
        console.log('Simulando pago x402 para query...');
        response = await makeRequest(true);
        
        if (response.status === 402) {
          throw new Error(`Payment required: ${paymentData.amount} ${paymentData.currency}. Payment simulation failed.`);
        }
      } else {
        throw new Error(`PAYMENT_REQUIRED:${JSON.stringify(paymentData)}`);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error querying score:', error);
    throw error;
  }
}

/**
 * Verify SBT (for other dApps)
 */
export async function verifySBTWithX402(sbtTokenId: string, walletAddress: string, simulatePayment: boolean = false): Promise<any> {
  try {
    const makeRequest = async (includePayment: boolean = false) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (includePayment || simulatePayment) {
        headers['X-Payment'] = 'simulated-payment-mvp';
      }

      return fetch(
        `${API_URL}/api/score/verify?sbtTokenId=${sbtTokenId}&walletAddress=${walletAddress}`,
        {
          method: 'GET',
          headers,
        }
      );
    };

    let response = await makeRequest(false);

    if (response.status === 402) {
      const paymentData = await response.json();
      
      if (simulatePayment) {
        console.log('Simulando pago x402 para verify...');
        response = await makeRequest(true);
        
        if (response.status === 402) {
          throw new Error(`Payment required: ${paymentData.amount} ${paymentData.currency}. Payment simulation failed.`);
        }
      } else {
        throw new Error(`PAYMENT_REQUIRED:${JSON.stringify(paymentData)}`);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying SBT:', error);
    throw error;
  }
}

