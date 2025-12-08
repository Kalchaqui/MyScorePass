'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, TrendingUp, CreditCard, Coins } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getCurrentExchange, isAuthenticated, getAuthHeaders } from '@/lib/auth';
import { Exchange } from '@/lib/auth';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UsageHistory {
  id: number;
  exchangeId: number;
  type?: string;
  amount?: number;
  credits?: number;
  action?: string;
  paymentTxHash?: string;
  timestamp: string;
}

export default function UsagePage() {
  const router = useRouter();
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [history, setHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const currentExchange = await getCurrentExchange();
        setExchange(currentExchange);

        // Cargar historial
        const response = await fetch(`${API_URL}/api/subscriptions/usage`, {
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data.history || []);
        }
      } catch (error: any) {
        if (error.message === 'Session expired') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

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

  const purchases = history.filter(h => !h.type || h.type === 'purchase');
  const consumptions = history.filter(h => h.type === 'consumption');

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-40">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Usage History</h2>
          <p className="text-white/70">View your purchases and credit consumption</p>
        </div>

        {exchange && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Coins className="w-6 h-6 text-green-400" />
                <span className="text-white/70">Current Credits</span>
              </div>
              <p className="text-3xl font-bold text-white">{exchange.credits}</p>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-2">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <span className="text-white/70">Total Purchased</span>
              </div>
              <p className="text-3xl font-bold text-white">{exchange.totalPurchased}</p>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <span className="text-white/70">Total Consumed</span>
              </div>
              <p className="text-3xl font-bold text-white">{exchange.totalConsumed}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Compras */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
              Purchases ({purchases.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {purchases.length === 0 ? (
                <p className="text-white/50 text-center py-8">No purchases recorded</p>
              ) : (
                purchases.map((purchase) => (
                  <div key={purchase.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">+{purchase.credits} credits</p>
                        <p className="text-white/50 text-sm">{purchase.amount} USDC</p>
                        <p className="text-white/30 text-xs mt-1">
                          {new Date(purchase.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Consumos */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
              Queries ({consumptions.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {consumptions.length === 0 ? (
                <p className="text-white/50 text-center py-8">No queries recorded</p>
              ) : (
                consumptions.map((consumption) => (
                  <div key={consumption.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">-{consumption.credits} credit(s)</p>
                        <p className="text-white/50 text-sm capitalize">
                          {consumption.action?.replace('_', ' ') || 'Query'}
                        </p>
                        <p className="text-white/30 text-xs mt-1">
                          {new Date(consumption.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
