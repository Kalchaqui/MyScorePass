'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, CreditCard, Coins, Zap, Wallet } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getCurrentExchange, isAuthenticated, getAuthHeaders, getToken } from '@/lib/auth';
import { Exchange } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { generateX402PaymentProof } from '@/lib/x402Payment';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PRICING = {
  USDC_PER_CREDIT: 0.02, // 0.2 USDC por 10 créditos = 0.02 USDC por crédito
  MIN_PURCHASE: 10,
};

export default function SubscriptionPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [credits, setCredits] = useState(PRICING.MIN_PURCHASE);
  
  // Avalanche Fuji Testnet chain ID
  const AVALANCHE_FUJI_CHAIN_ID = 43113;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const loadExchange = async () => {
      try {
        const currentExchange = await getCurrentExchange();
        setExchange(currentExchange);
      } catch (error: any) {
        if (error.message === 'Session expired') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadExchange();
  }, [router]);

  const calculatePrice = (credits: number) => {
    return credits * PRICING.USDC_PER_CREDIT;
  };

  const handlePurchase = async () => {
    if (!exchange) return;

    if (credits < PRICING.MIN_PURCHASE) {
      toast.error(`Minimum ${PRICING.MIN_PURCHASE} credits`);
      return;
    }

    setPurchasing(true);
    try {
      const resourceUrl = `${API_URL}/api/subscriptions/purchase`;
      const price = `$${calculatePrice(credits)}`;

      // Verificar que el token esté disponible antes de hacer la request
      const token = getToken();
      console.log('Token obtenido:', token ? 'Sí (longitud: ' + token.length + ')' : 'No');
      
      if (!token) {
        toast.error('Your session has expired. Please sign in again.');
        router.push('/login');
        return;
      }

      // Obtener headers de autenticación
      const authHeaders = getAuthHeaders();
      console.log('Auth headers para primera request:', authHeaders);
      console.log('Authorization header:', authHeaders['Authorization'] ? 'Sí' : 'No');

      // Primera llamada - debería devolver 402
      let response = await fetch(resourceUrl, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ credits }),
      });
      
      console.log('Primera response status:', response.status);
      
      // Si recibimos 401, el token puede estar expirado o inválido
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error 401 en primera request:', errorData);
        toast.error('Your session has expired. Please sign in again.');
        router.push('/login');
        setPurchasing(false);
        return;
      }

      if (response.status === 402) {
        const paymentData = await response.json();
        console.log('Payment required:', paymentData);

        // Verificar si el wallet está conectado
        if (!isConnected || !address) {
          toast.error(
            `Payment required: ${paymentData.amount} ${paymentData.currency}. ` +
            `Please connect your wallet to Avalanche Fuji Testnet to complete the payment.`,
            { duration: 6000, id: 'payment' }
          );
          setPurchasing(false);
          return;
        }

        // Verificar que el wallet esté en la red correcta (Avalanche Fuji)
        console.log('Current chain ID:', chainId);
        if (chainId !== AVALANCHE_FUJI_CHAIN_ID) {
          toast.error(
            `Please switch to Avalanche Fuji Testnet (Chain ID: ${AVALANCHE_FUJI_CHAIN_ID}). ` +
            `Current network: Chain ID ${chainId}`,
            { duration: 8000, id: 'payment' }
          );
          setPurchasing(false);
          return;
        }

        // Wallet conectado y en la red correcta - procesar pago con x402 REAL
        // Verify walletClient is available before proceeding
        if (!walletClient) {
          toast.error(
            'Wallet client not ready. Please wait a moment and try again.',
            { duration: 5000, id: 'payment' }
          );
          setPurchasing(false);
          return;
        }

        // Additional validation: ensure walletClient has required properties
        if (!walletClient.account || !walletClient.account.address) {
          toast.error(
            'Wallet account not available. Please reconnect your wallet.',
            { duration: 5000, id: 'payment' }
          );
          setPurchasing(false);
          return;
        }

        if (!walletClient.chain) {
          toast.error(
            'Wallet chain not configured. Please switch to Avalanche Fuji Testnet.',
            { duration: 5000, id: 'payment' }
          );
          setPurchasing(false);
          return;
        }

        toast.loading(
          `Generating payment proof for ${paymentData.amount} ${paymentData.currency}...`,
          { id: 'payment' }
        );

        // Generar proof real del pago usando SDK de x402
        // Esto abrirá el wallet del usuario para aprobar la transacción
        const price = `$${paymentData.amount}`;
        let paymentProof: string;
        
        try {
          console.log('Calling generateX402PaymentProof with:', {
            resourceUrl,
            method: 'POST',
            price,
            accountAddress: address,
            chainId,
            walletClientAccount: walletClient.account.address,
            walletClientChain: walletClient.chain.id,
          });
          
          paymentProof = await generateX402PaymentProof(
            resourceUrl,
            'POST',
            price,
            address,
            chainId,
            walletClient
          );
          
          console.log('Payment proof generated successfully:', paymentProof.substring(0, 50) + '...');
        } catch (error: any) {
          console.error('Error generating payment proof:', error);
          toast.error(`Failed to generate payment proof: ${error.message}`, { id: 'payment' });
          setPurchasing(false);
          return;
        }

        // Actualizar toast para mostrar que estamos enviando el proof
        toast.loading(
          `Verifying payment with smart contracts...`,
          { id: 'payment' }
        );
        
        // Reintentar la request con header X-Payment que contiene el proof real
        const authHeaders = getAuthHeaders();
        console.log('Sending payment proof to backend for verification...');
        
        try {
          response = await fetch(resourceUrl, {
            method: 'POST',
            headers: {
              ...authHeaders,
              'X-Payment': paymentProof, // Proof real generado por x402 SDK
            },
            body: JSON.stringify({ credits }),
          });
          
          console.log('Response status after sending proof:', response.status);
          
          // Si el error es 401, el token puede haber expirado
          if (response.status === 401) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error 401 - Token inválido o expirado:', errorData);
            toast.error('Your session has expired. Please sign in again.', { id: 'payment' });
            setPurchasing(false);
            router.push('/login');
            return;
          }
          
          // Si el error es 402, el pago no fue verificado
          if (response.status === 402) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error 402 - Payment verification failed:', errorData);
            toast.error(
              `Payment verification failed: ${errorData.error || errorData.description || 'Unknown error'}`,
              { id: 'payment', duration: 8000 }
            );
            setPurchasing(false);
            return;
          }
        } catch (fetchError: any) {
          console.error('Error sending payment proof to backend:', fetchError);
          toast.error(`Failed to verify payment: ${fetchError.message}`, { id: 'payment' });
          setPurchasing(false);
          return;
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Purchase failed:', error);
        toast.error(error.error || 'Purchase failed', { id: 'payment' });
        setPurchasing(false);
        return;
      }

      const data = await response.json();
      console.log('Purchase successful:', data);
      
      // Actualizar exchange
      try {
        const updatedExchange = await getCurrentExchange();
        setExchange(updatedExchange);
      } catch (exchangeError: any) {
        console.warn('Failed to update exchange data:', exchangeError);
        // No bloquear el éxito del pago si falla la actualización
      }
      
      toast.success(`Purchase successful! ${credits} credits added.`, { id: 'payment' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Unexpected error in handlePurchase:', error);
      toast.error(error.message || 'Error purchasing credits', { id: 'payment' });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen relative">
        <AnimatedBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </main>
    );
  }

  const price = calculatePrice(credits);

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                MyScorePass
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-40">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Buy Credits</h2>
          <p className="text-white/70">Purchase credits to query the user database</p>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-cyan-400" />
              Select Credit Amount
            </h3>
            
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">
                Credits (minimum {PRICING.MIN_PURCHASE})
              </label>
              <input
                type="number"
                min={PRICING.MIN_PURCHASE}
                value={credits}
                onChange={(e) => setCredits(Math.max(PRICING.MIN_PURCHASE, parseInt(e.target.value) || PRICING.MIN_PURCHASE))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-2xl font-bold text-center"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setCredits(10)}
                className={`px-4 py-2 rounded-lg ${credits === 10 ? 'bg-cyan-500' : 'bg-white/10'} text-white transition-all ${credits === 10 ? 'shadow-lg shadow-cyan-500/50' : ''}`}
              >
                10 credits
              </button>
              <button
                onClick={() => setCredits(50)}
                className={`px-4 py-2 rounded-lg ${credits === 50 ? 'bg-cyan-500' : 'bg-white/10'} text-white transition-all ${credits === 50 ? 'shadow-lg shadow-cyan-500/50' : ''}`}
              >
                50 credits
              </button>
              <button
                onClick={() => setCredits(100)}
                className={`px-4 py-2 rounded-lg ${credits === 100 ? 'bg-cyan-500' : 'bg-white/10'} text-white transition-all ${credits === 100 ? 'shadow-lg shadow-cyan-500/50' : ''}`}
              >
                100 credits
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/70">Credits:</span>
              <span className="text-2xl font-bold text-white">{credits}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/70">Price per credit:</span>
              <span className="text-white">{PRICING.USDC_PER_CREDIT} USDC</span>
            </div>
            <div className="border-t border-white/20 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold text-white">Total:</span>
              <span className="text-3xl font-bold text-green-400">{price} USDC</span>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div className="text-sm text-white/80 flex-1">
                <p className="font-medium mb-1">Payment via x402</p>
                <p className="mb-3">Payment will be processed using Thirdweb's x402 protocol. Each credit allows you to perform 1 database query.</p>
                {!isConnected && (
                  <div className="mt-3 pt-3 border-t border-cyan-500/20">
                    <p className="text-yellow-400 mb-2 text-xs">⚠️ Wallet not connected</p>
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4" />
                      <ConnectButton.Custom>
                        {({ account, chain, openConnectModal, mounted }) => {
                          return (
                            <button
                              onClick={openConnectModal}
                              className="text-xs btn-secondary px-3 py-1"
                            >
                              Connect Wallet
                            </button>
                          );
                        }}
                      </ConnectButton.Custom>
                    </div>
                  </div>
                )}
                {isConnected && address && (
                  <div className="mt-3 pt-3 border-t border-cyan-500/20">
                    <p className="text-green-400 mb-1 text-xs">✅ Wallet connected</p>
                    <p className="text-xs text-white/60">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {exchange && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-white/70 text-sm mb-2">
                <span>Current credits:</span>
                <span className="font-bold text-white">{exchange.credits}</span>
              </div>
              <div className="flex items-center justify-between text-white/70 text-sm">
                <span>Credits after purchase:</span>
                <span className="font-bold text-green-400">{exchange.credits + credits}</span>
              </div>
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={purchasing || credits < PRICING.MIN_PURCHASE}
            className="w-full btn-primary flex items-center justify-center space-x-2 py-4 text-lg"
          >
            {purchasing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing payment...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Buy {credits} credits for {price} USDC</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
