/**
 * x402 Payment Proof Generation
 * Generates real payment proof using Thirdweb x402 SDK
 * 
 * Note: This uses the x402 protocol where the client makes a real payment transaction
 * and sends the proof to the backend for verification
 */

import { createThirdwebClient } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import type { WalletClient } from 'viem';
import { parseUnits, createPublicClient, http, encodeFunctionData } from 'viem';
import { avalancheFuji as avalancheFujiViem } from 'viem/chains';

// Avalanche Fuji Testnet
const avalancheFuji = defineChain(43113);

// Create Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '',
});

// Server wallet address (merchant/receiver)
const SERVER_WALLET_ADDRESS = process.env.NEXT_PUBLIC_THIRDWEB_SERVER_WALLET_ADDRESS as `0x${string}`;

// USDC contract address on Avalanche Fuji Testnet
// You may need to update this with the actual USDC testnet address
const USDC_CONTRACT_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65' as `0x${string}`; // Example - verify this address

/**
 * Create payment proof using x402 SDK with wagmi-connected wallet
 * This will make a real payment transaction and return the proof
 * @param resourceUrl - The URL of the resource being accessed
 * @param method - HTTP method (POST, GET, etc.)
 * @param price - Price in format "$0.20" (amount in USDC)
 * @param accountAddress - The connected wallet address from wagmi
 * @param chainId - The chain ID (should be 43113 for Avalanche Fuji)
 * @param walletClient - The wagmi wallet client (optional, will auto-detect if not provided)
 * @returns Payment proof string to send in X-Payment header
 */
export async function generateX402PaymentProof(
  resourceUrl: string,
  method: string,
  price: string,
  accountAddress: `0x${string}`,
  chainId: number,
  walletClient?: WalletClient
): Promise<string> {
  try {
    // Validate chain ID
    if (chainId !== 43113) {
      throw new Error(`Invalid network. Please switch to Avalanche Fuji Testnet (Chain ID: 43113). Current chain ID: ${chainId}`);
    }

    // Extract amount from price string (e.g., "$0.20" -> "0.20")
    const amount = price.replace('$', '');
    
    console.log('Starting payment proof generation...', {
      resourceUrl,
      method,
      amount,
      accountAddress,
      chainId,
      hasWalletClient: !!walletClient,
    });

    // Use wagmi walletClient to send the transaction directly
    if (!walletClient) {
      throw new Error('Wallet client not available. Please ensure your wallet is connected via wagmi.');
    }

    // Validate walletClient has required properties
    if (!walletClient.account) {
      throw new Error('Wallet account not available. Please ensure your wallet is connected and try again.');
    }

    if (!walletClient.account.address) {
      throw new Error('Wallet address not available. Please reconnect your wallet.');
    }

    // Validate chain is configured
    if (!walletClient.chain) {
      throw new Error('Wallet chain not configured. Please switch to Avalanche Fuji Testnet (Chain ID: 43113) and try again.');
    }

    // Verify chain ID matches
    if (walletClient.chain.id !== 43113) {
      throw new Error(`Invalid network. Please switch to Avalanche Fuji Testnet (Chain ID: 43113). Current chain ID: ${walletClient.chain.id}`);
    }

    console.log('Using wagmi walletClient for transaction:', {
      address: walletClient.account.address,
      chain: walletClient.chain.id,
      chainName: walletClient.chain.name,
    });

    // Convert amount to USDC units (USDC has 6 decimals)
    const amountInUnits = parseUnits(amount, 6);
    console.log('Amount converted:', { amount, amountInUnits: amountInUnits.toString() });

    // Prepare ERC20 transfer function data using viem's encodeFunctionData
    // This ensures proper ABI encoding
    const data = encodeFunctionData({
      abi: [
        {
          name: 'transfer',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'transfer',
      args: [SERVER_WALLET_ADDRESS, amountInUnits],
    });

    console.log('Preparing ERC20 transfer transaction...', {
      contractAddress: USDC_CONTRACT_ADDRESS,
      to: SERVER_WALLET_ADDRESS,
      amount: amountInUnits.toString(),
      amountFormatted: amount,
      dataLength: data.length,
    });

    // Verify contract and user balance before sending transaction
    // This helps prevent automatic reverts due to insufficient balance or invalid contract
    try {
      const publicClient = createPublicClient({
        chain: avalancheFujiViem,
        transport: http(),
      });

      // First, verify the contract exists and is a valid ERC20
      console.log('Verifying USDC contract...', { contractAddress: USDC_CONTRACT_ADDRESS });
      
      // Check if contract has code
      const contractCode = await publicClient.getBytecode({
        address: USDC_CONTRACT_ADDRESS,
      });
      
      if (!contractCode || contractCode === '0x') {
        throw new Error(
          `Invalid USDC contract address: ${USDC_CONTRACT_ADDRESS}. ` +
          `No contract code found at this address. Please verify the contract address is correct for Avalanche Fuji Testnet.`
        );
      }
      
      console.log('✅ Contract code found at address');

      // Check if contract is paused (some USDC contracts have pause functionality)
      try {
        const pausedData = encodeFunctionData({
          abi: [
            {
              name: 'paused',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'bool' }],
            },
          ],
          functionName: 'paused',
          args: [],
        });

        const pausedResult = await publicClient.call({
          to: USDC_CONTRACT_ADDRESS,
          data: pausedData,
        });

        if (pausedResult.data && pausedResult.data !== '0x') {
          const pausedHex = pausedResult.data.startsWith('0x') 
            ? pausedResult.data.slice(2) 
            : pausedResult.data;
          const isPaused = BigInt('0x' + pausedHex) !== 0n;
          
          if (isPaused) {
            throw new Error(
              'USDC contract is currently paused. Transfers are not allowed at this time. ' +
              'Please try again later or contact support.'
            );
          }
        }
      } catch (pausedError: any) {
        // If paused() function doesn't exist, that's fine - not all contracts have it
        if (!pausedError.message?.includes('paused')) {
          console.log('Contract does not have pause functionality (this is normal)');
        } else {
          throw pausedError;
        }
      }

      // Check USDC balance using balanceOf(address) function
      const balanceData = encodeFunctionData({
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }],
          },
        ],
        functionName: 'balanceOf',
        args: [accountAddress],
      });

      const balanceResult = await publicClient.call({
        to: USDC_CONTRACT_ADDRESS,
        data: balanceData,
      });

      if (balanceResult.data && balanceResult.data !== '0x') {
        // Decode balance - remove '0x' prefix and convert from hex
        const balanceHex = balanceResult.data.startsWith('0x') 
          ? balanceResult.data.slice(2) 
          : balanceResult.data;
        const balance = BigInt('0x' + balanceHex);
        const balanceFormatted = (Number(balance) / 1e6).toFixed(6);
        
        console.log('USDC balance check:', {
          balance: balance.toString(),
          balanceFormatted: `${balanceFormatted} USDC`,
          required: amountInUnits.toString(),
          requiredFormatted: `${amount} USDC`,
          sufficient: balance >= amountInUnits,
        });

        if (balance < amountInUnits) {
          throw new Error(
            `Insufficient USDC balance. You have ${balanceFormatted} USDC, but need ${amount} USDC. ` +
            `Please add more USDC to your wallet on Avalanche Fuji Testnet.`
          );
        }
        
        console.log('✅ Balance sufficient for transaction');
      } else {
        console.warn('Could not decode balance from contract response:', balanceResult);
      }
    } catch (balanceError: any) {
      // If balance check fails, log but continue (some networks might not support this)
      console.warn('Could not verify USDC balance:', balanceError.message);
      // Don't throw - let the transaction attempt proceed
    }

    // Send the transaction using wagmi walletClient
    console.log('Sending transaction, requesting user approval in wallet...');
    console.log('Transaction details:', {
      to: USDC_CONTRACT_ADDRESS,
      from: accountAddress,
      value: '0',
      data: data,
      dataPreview: data.substring(0, 20) + '...',
      amount: `${amount} USDC`,
      amountInUnits: amountInUnits.toString(),
      recipient: SERVER_WALLET_ADDRESS,
    });

    let transactionHash: `0x${string}`;
    try {
      // Use estimateGas first to catch potential issues before user approval
      try {
        const publicClient = createPublicClient({
          chain: avalancheFujiViem,
          transport: http(),
        });

        console.log('Estimating gas for transaction...');
        const gasEstimate = await publicClient.estimateGas({
          account: walletClient.account,
          to: USDC_CONTRACT_ADDRESS,
          data,
          value: 0n,
        });
        console.log('✅ Gas estimate:', gasEstimate.toString());
      } catch (gasError: any) {
        console.error('❌ Gas estimation failed:', gasError.message);
        console.error('Gas error details:', {
          name: gasError.name,
          message: gasError.message,
          shortMessage: gasError.shortMessage,
          cause: gasError.cause,
        });
        
        // If gas estimation fails, it usually means the transaction will revert
        // Check for specific error messages
        if (gasError.message?.includes('insufficient') || 
            gasError.message?.includes('balance') ||
            gasError.message?.includes('ERC20: transfer amount exceeds balance')) {
          throw new Error(
            `Insufficient USDC balance. Please ensure you have at least ${amount} USDC in your wallet.`
          );
        }
        
        if (gasError.message?.includes('execution reverted') || 
            gasError.message?.includes('revert')) {
          throw new Error(
            `Transaction would revert: ${gasError.shortMessage || gasError.message}. ` +
            `This might indicate the USDC contract address is incorrect or the contract has restrictions. ` +
            `Contract address: ${USDC_CONTRACT_ADDRESS}`
          );
        }
        
        // Don't throw for other gas estimation errors - let the user try the transaction
        // Some wallets don't support gas estimation for contract calls
        console.warn('Gas estimation failed, but proceeding with transaction attempt...');
      }

      transactionHash = await walletClient.sendTransaction({
        to: USDC_CONTRACT_ADDRESS,
        data,
        value: 0n, // ERC20 transfer doesn't send native token
      });
      console.log('Transaction sent successfully:', transactionHash);
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        shortMessage: error.shortMessage,
        cause: error.cause,
        stack: error.stack,
      });

      // Check for specific error types
      if (error.message?.includes('user rejected') || 
          error.message?.includes('User denied') ||
          error.message?.includes('rejected') ||
          error.name === 'UserRejectedRequestError' ||
          error.code === 4001) {
        throw new Error(
          'Transaction was rejected in your wallet. ' +
          'Please click "Confirm" or "Approve" in MetaMask to complete the payment. ' +
          'If the transaction keeps getting rejected, check that you have sufficient USDC balance.'
        );
      }

      // Check for insufficient balance errors
      if (error.message?.includes('insufficient') || 
          error.message?.includes('balance') ||
          error.message?.includes('revert') ||
          error.message?.includes('ERC20: transfer amount exceeds balance')) {
        throw new Error(
          `Insufficient USDC balance. You need at least ${amount} USDC to complete this transaction. ` +
          `Please add more USDC to your wallet on Avalanche Fuji Testnet.`
        );
      }

      // Check for gas estimation errors (often indicates transaction will fail)
      if (error.message?.includes('gas') || 
          error.message?.includes('execution reverted') ||
          error.message?.includes('revert')) {
        throw new Error(
          `Transaction would fail: ${error.message}. ` +
          `Possible causes: insufficient USDC balance, invalid contract address, or contract error. ` +
          `Please verify you have at least ${amount} USDC in your wallet.`
        );
      }

      // Generic error with helpful message
      throw new Error(
        `Failed to send transaction: ${error.message || error.shortMessage || 'Unknown error'}. ` +
        `Please ensure you have sufficient USDC balance (${amount} USDC) and try again.`
      );
    }

    console.log('Waiting for transaction confirmation...');
    let receipt;
    try {
      // Create a public client to wait for receipt
      const publicClient = createPublicClient({
        chain: avalancheFujiViem,
        transport: http(),
      });
      
      receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });
      
      console.log('Transaction receipt received:', {
        hash: receipt.transactionHash,
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
      });

      // Check if transaction was reverted
      if (receipt.status === 'reverted') {
        console.error('Transaction was reverted!');
        throw new Error(
          `Transaction was reverted. This usually means:\n` +
          `1. Insufficient USDC balance (you need at least ${amount} USDC)\n` +
          `2. The USDC contract address might be incorrect\n` +
          `3. The contract might have restrictions\n\n` +
          `Please check your USDC balance and try again. ` +
          `Transaction hash: ${transactionHash}`
        );
      }

      if (receipt.status === 'success') {
        console.log('✅ Transaction confirmed successfully');
      }
    } catch (error: any) {
      console.error('Error waiting for receipt:', error);
      
      // Check if it's a revert error
      if (error.message?.includes('revert') || error.message?.includes('reverted')) {
        throw new Error(
          `Transaction was reverted. Please ensure you have at least ${amount} USDC in your wallet ` +
          `and that the USDC contract address is correct. Transaction hash: ${transactionHash}`
        );
      }
      
      throw new Error(`Transaction sent but confirmation failed: ${error.message || 'Unknown error'}`);
    }

    // Generate payment proof from the transaction receipt
    // The proof format should match what settlePayment() expects
    const paymentProof = JSON.stringify({
      transactionHash: receipt.transactionHash,
      resourceUrl,
      method,
      amount,
      payTo: SERVER_WALLET_ADDRESS,
      network: 'avalanche-fuji',
      chainId: 43113,
      timestamp: Date.now(),
      from: accountAddress,
    });

    console.log('Payment proof generated successfully');
    return paymentProof;
  } catch (error) {
    console.error('Error generating x402 payment proof:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide more specific error messages
    if (errorMessage.includes('Invalid network')) {
      throw error; // Re-throw network errors as-is
    }
    if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
      throw error; // Re-throw user rejection errors as-is
    }
    
    throw new Error(`Failed to generate payment proof: ${errorMessage}`);
  }
}

