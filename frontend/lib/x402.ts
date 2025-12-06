/**
 * x402 Payment Integration for MyScorePass
 * Based on Thirdweb x402 facilitator
 */

import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";

// Avalanche Fuji Testnet
export const avalancheFuji = defineChain(43113);

// Create Thirdweb client
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "placeholder",
});

// Facilitator wallet (ERC4337 Smart Account)
// This wallet pays for gas on behalf of users
export function getFacilitatorWallet() {
  if (!process.env.NEXT_PUBLIC_THIRDWEB_SERVER_WALLET_ADDRESS) {
    throw new Error("THIRDWEB_SERVER_WALLET_ADDRESS not configured");
  }

  return createWallet("smart", {
    client,
    personalAccount: {
      address: process.env.NEXT_PUBLIC_THIRDWEB_SERVER_WALLET_ADDRESS as `0x${string}`,
    },
  });
}

// Merchant wallet (receives payments)
export const MERCHANT_WALLET = process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS as `0x${string}`;

// Payment amounts (in USDC)
export const PAYMENT_AMOUNTS = {
  CALCULATE_SCORE: "0.50", // 0.50 USDC for calculating score + minting SBT
  QUERY_SCORE: "0.50", // 0.50 USDC for querying existing score
  VERIFY_SBT: "0.10", // 0.10 USDC for verifying SBT (for other dApps)
} as const;

/**
 * Check if a response is HTTP 402 (Payment Required)
 */
export function isPaymentRequired(response: Response): boolean {
  return response.status === 402;
}

/**
 * Handle x402 payment flow
 * This function will be called when backend responds with HTTP 402
 */
export async function handleX402Payment(
  response: Response,
  onPaymentComplete: () => Promise<Response>
): Promise<Response> {
  if (!isPaymentRequired(response)) {
    return response;
  }

  // Parse payment instructions from 402 response
  const paymentData = await response.json();
  
  // The x402 SDK should handle the payment automatically
  // For now, we'll return the payment data
  // In production, this would trigger the payment modal
  
  console.log("Payment required:", paymentData);
  
  // After payment, retry the request
  return onPaymentComplete();
}

