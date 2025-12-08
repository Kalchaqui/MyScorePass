'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, Users, CreditCard, TrendingUp, LogOut, Coins } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getCurrentExchange, logout, isAuthenticated, usePrivy } from '@/lib/auth';
import { Exchange } from '@/lib/auth';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const { ready, authenticated, logout: privyLogout } = usePrivy();
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esperar a que Privy esté listo
    if (!ready) return;

    // Verificar autenticación de Privy y token JWT
    if (!authenticated || !isAuthenticated()) {
      router.push('/login');
      return;
    }

    const loadExchange = async () => {
      try {
        const currentExchange = await getCurrentExchange();
        setExchange(currentExchange);
      } catch (error: any) {
        console.error('Error loading exchange:', error);
        if (error.message === 'Session expired') {
          privyLogout();
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadExchange();
  }, [router, ready, authenticated, privyLogout]);

  const handleLogout = async () => {
    // Cerrar sesión en Privy y backend
    await privyLogout();
    logout();
    toast.success('Session closed');
    router.push('/login');
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

  if (!exchange) {
    router.push('/login');
    return null;
  }

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header flotante */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Home
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-cyan-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                  MyScorePass
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/70 text-sm">{exchange.name}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-40">
        {/* Bienvenida */}
        <div className="mb-12 fade-in-up">
          <h2 className="text-5xl font-bold text-white mb-3">Exchange Dashboard</h2>
          <p className="text-xl text-white/70">Welcome, {exchange.name}</p>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Créditos Disponibles */}
          <div className="glass-card group hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Credits</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">{exchange.credits}</p>
              <p className="text-white/70 mb-6">Available credits</p>
              <Link href="/dashboard/subscription" className="btn-primary w-full text-center block">
                Buy Credits
              </Link>
            </div>
          </div>

          {/* Total Comprado */}
          <div className="glass-card group hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Total Purchased</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/50">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">{exchange.totalPurchased}</p>
              <p className="text-white/70 mb-6">Credits purchased</p>
              <Link href="/dashboard/subscription" className="btn-secondary w-full text-center block">
                View History
              </Link>
            </div>
          </div>

          {/* Total Consumido */}
          <div className="glass-card group hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Total Consumed</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">{exchange.totalConsumed}</p>
              <p className="text-white/70 mb-6">Queries performed</p>
              <Link href="/dashboard/usage" className="btn-secondary w-full text-center block">
                View Details
              </Link>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="glass-card">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-yellow-300" />
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/dashboard/users" className="btn-primary text-center py-6 text-lg flex items-center justify-center space-x-2">
              <Users className="w-6 h-6" />
              <span>Query Users</span>
            </Link>
            <Link href="/dashboard/subscription" className="btn-secondary text-center py-6 text-lg flex items-center justify-center space-x-2">
              <CreditCard className="w-6 h-6" />
              <span>Buy Credits</span>
            </Link>
            <Link href="/dashboard/usage" className="btn-secondary text-center py-6 text-lg flex items-center justify-center space-x-2">
              <TrendingUp className="w-6 h-6" />
              <span>View Usage</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
