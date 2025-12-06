/**
 * Thirdweb API Service
 * Para usar el Project Wallet de Thirdweb y enviar transacciones
 * 
 * NOTA: Esto NO es necesario para el MVP básico.
 * Solo úsalo si quieres que Thirdweb pague el gas por ti.
 */

interface ThirdwebTransaction {
  data: string;
  to: string;
  value: string;
}

interface ThirdwebTransactionRequest {
  chainId: number;
  transactions: ThirdwebTransaction[];
}

interface ThirdwebTransactionResponse {
  queueId: string;
  result?: {
    transactionHash: string;
  };
}

/**
 * Enviar transacción usando Thirdweb API
 * Requiere: Secret Key de Thirdweb
 */
export async function sendTransactionViaThirdweb(
  secretKey: string,
  chainId: number,
  transactions: ThirdwebTransaction[]
): Promise<ThirdwebTransactionResponse> {
  const response = await fetch('https://api.thirdweb.com/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-secret-key': secretKey,
    },
    body: JSON.stringify({
      chainId,
      transactions,
    } as ThirdwebTransactionRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Thirdweb API error: ${error.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Ejemplo: Mintear SBT usando Thirdweb Project Wallet
 * 
 * Esto pagaría el gas usando el Project Wallet de Thirdweb
 * en lugar de tu wallet del backend
 */
export async function mintSBTViaThirdweb(
  secretKey: string,
  sbtContractAddress: string,
  to: string,
  scoreHash: string,
  score: number,
  verificationLevel: number
): Promise<string> {
  // Encodear la función mintSBT
  // Esto es un ejemplo, necesitarías el ABI completo
  const mintFunction = '0x...'; // Encoded function call
  
  const response = await sendTransactionViaThirdweb(
    secretKey,
    43113, // Avalanche Fuji Chain ID
    [
      {
        data: mintFunction,
        to: sbtContractAddress,
        value: '0',
      },
    ]
  );

  return response.result?.transactionHash || response.queueId;
}

/**
 * Ejemplo de uso en backend/routes/score.js:
 * 
 * const { sendTransactionViaThirdweb } = require('./services/thirdwebApi');
 * 
 * // En lugar de usar ethers directamente:
 * // const tx = await scorePassSBT.mintSBT(...);
 * 
 * // Usarías Thirdweb API:
 * // const txHash = await sendTransactionViaThirdweb(
 * //   process.env.THIRDWEB_SECRET_KEY,
 * //   43113,
 * //   [{ data: encodedFunction, to: sbtAddress, value: '0' }]
 * // );
 */

