'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, CreditCard, Coins, Zap } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getCurrentExchange, isAuthenticated, getAuthHeaders } from '@/lib/auth';
import { Exchange } from '@/lib/auth';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PRICING = {
  USDC_PER_CREDIT: 100,
  MIN_PURCHASE: 10,
};

export default function SubscriptionPage() {
  const router = useRouter();
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
      toast.error(`Mínimo ${PRICING.MIN_PURCHASE} créditos`);
      return;
    }

    setPurchasing(true);
    try {
      // Primera llamada - debería devolver 402
      let response = await fetch(`${API_URL}/api/subscriptions/purchase`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ credits }),
      });

      if (response.status === 402) {
        const paymentData = await response.json();
        console.log('Payment required:', paymentData);

        const confirmPayment = window.confirm(
          `Pago requerido: ${paymentData.amount} ${paymentData.currency} por ${credits} créditos.\n\n` +
          `En este MVP, el pago está simulado. ¿Deseas continuar con la simulación?`
        );

        if (confirmPayment) {
          // Simular pago y reintentar con header X-Payment
          response = await fetch(`${API_URL}/api/subscriptions/purchase`, {
            method: 'POST',
            headers: {
              ...getAuthHeaders(),
              'X-Payment': 'simulated-payment-proof',
            },
            body: JSON.stringify({ credits }),
          });
        } else {
          setPurchasing(false);
          return;
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
      
      toast.success(`¡Compra exitosa! ${credits} créditos agregados.`);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error al comprar créditos');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen relative">
        <AnimatedBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Cargando...</div>
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
          <h2 className="text-4xl font-bold text-white mb-2">Comprar Créditos</h2>
          <p className="text-white/70">Compra créditos para consultar la base de datos de usuarios</p>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-purple-400" />
              Selecciona Cantidad de Créditos
            </h3>
            
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">
                Créditos (mínimo {PRICING.MIN_PURCHASE})
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
                10 créditos
              </button>
              <button
                onClick={() => setCredits(50)}
                className={`px-4 py-2 rounded-lg ${credits === 50 ? 'bg-purple-500' : 'bg-white/10'} text-white`}
              >
                50 créditos
              </button>
              <button
                onClick={() => setCredits(100)}
                className={`px-4 py-2 rounded-lg ${credits === 100 ? 'bg-purple-500' : 'bg-white/10'} text-white`}
              >
                100 créditos
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/70">Créditos:</span>
              <span className="text-2xl font-bold text-white">{credits}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/70">Precio por crédito:</span>
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
              <div className="text-sm text-white/80">
                <p className="font-medium mb-1">Pago vía x402</p>
                <p>El pago se procesará usando el protocolo x402 de Thirdweb. Cada crédito te permite realizar 1 consulta a la base de datos.</p>
              </div>
            </div>
          </div>

          {exchange && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-white/70 text-sm mb-2">
                <span>Créditos actuales:</span>
                <span className="font-bold text-white">{exchange.credits}</span>
              </div>
              <div className="flex items-center justify-between text-white/70 text-sm">
                <span>Créditos después de la compra:</span>
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
                <span>Procesando pago...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Comprar {credits} créditos por {price} USDC</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
