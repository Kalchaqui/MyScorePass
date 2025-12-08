'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, CreditCard, Coins, Zap, Wallet } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getCurrentExchange, isAuthenticated, getAuthHeaders, getToken } from '@/lib/auth';
import { Exchange } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PRICING = {
  USDC_PER_CREDIT: 0.02, // 0.2 USDC por 10 créditos = 0.02 USDC por crédito
  MIN_PURCHASE: 10,
};

export default function SubscriptionPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [credits, setCredits] = useState(PRICING.MIN_PURCHASE);

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
          throw new Error(
            `Wallet not connected. Please connect your wallet to Avalanche Fuji Testnet to process the payment of ${paymentData.amount} ${paymentData.currency}.`
          );
        }

        // Wallet conectado - procesar pago con x402
        toast.loading(
          `Processing payment of ${paymentData.amount} ${paymentData.currency} with x402...`,
          { id: 'payment' }
        );

        // Confirmar con el usuario antes de procesar el pago
        const confirmPayment = window.confirm(
          `Confirm payment:\n\n` +
          `Amount: ${paymentData.amount} ${paymentData.currency}\n` +
          `Credits: ${credits}\n` +
          `Wallet: ${address?.slice(0, 6)}...${address?.slice(-4)}\n\n` +
          `The payment will be processed from your connected wallet.\n` +
          `Do you want to continue?`
        );

        if (!confirmPayment) {
          setPurchasing(false);
          return;
        }

        // Reintentar la request con header X-Payment
        // Nota: En producción con x402 real, esto debería usar el SDK del cliente
        // para generar el proof correcto del pago desde el wallet del usuario.
        // Por ahora, el backend verificará el pago cuando reciba el header.
        const paymentHeader = `x402-payment-${address}-${Date.now()}`;
        console.log('Reintentando request con header X-Payment:', paymentHeader);
        
        // Obtener headers de autenticación
        const authHeaders = getAuthHeaders();
        console.log('Auth headers:', authHeaders);
        
        response = await fetch(resourceUrl, {
          method: 'POST',
          headers: {
            ...authHeaders,
            'X-Payment': paymentHeader, // Placeholder - en producción usar proof real del SDK
          },
          body: JSON.stringify({ credits }),
        });
        
        console.log('Response status después de reintentar:', response.status);
        
        // Si el error es 401, el token puede haber expirado
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error 401 - Token inválido o expirado:', errorData);
          throw new Error('Your session has expired. Please sign in again.');
        }
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Purchase failed');
      }

      const data = await response.json();
      
      // Actualizar exchange
      const updatedExchange = await getCurrentExchange();
      setExchange(updatedExchange);
      
      toast.success(`Purchase successful! ${credits} credits added.`, { id: 'payment' });
      router.push('/dashboard');
    } catch (error: any) {
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
              <Shield className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
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
              <CreditCard className="w-6 h-6 mr-2 text-purple-400" />
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
                className={`px-4 py-2 rounded-lg ${credits === 10 ? 'bg-purple-500' : 'bg-white/10'} text-white`}
              >
                10 credits
              </button>
              <button
                onClick={() => setCredits(50)}
                className={`px-4 py-2 rounded-lg ${credits === 50 ? 'bg-purple-500' : 'bg-white/10'} text-white`}
              >
                50 credits
              </button>
              <button
                onClick={() => setCredits(100)}
                className={`px-4 py-2 rounded-lg ${credits === 100 ? 'bg-purple-500' : 'bg-white/10'} text-white`}
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

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-white/80 flex-1">
                <p className="font-medium mb-1">Payment via x402</p>
                <p className="mb-3">Payment will be processed using Thirdweb's x402 protocol. Each credit allows you to perform 1 database query.</p>
                {!isConnected && (
                  <div className="mt-3 pt-3 border-t border-blue-500/20">
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
                  <div className="mt-3 pt-3 border-t border-blue-500/20">
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
