'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Shield, FileText, TrendingUp, DollarSign, ArrowLeft, Sparkles, CheckCircle, Clock } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userStatus, setUserStatus] = useState<string>('');
  const [dniUploaded, setDniUploaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      router.push('/');
    }
  }, [isConnected, router, mounted]);

  // Verificar estado del DNI
  useEffect(() => {
    if (address && mounted && isConnected) {
      checkUserStatus();
    }
  }, [address, mounted, isConnected]);

  const checkUserStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/users/status/${address}`);
      if (response.ok) {
        const data = await response.json();
        setUserStatus(data.status || 'not_found');
        setDniUploaded(data.status !== 'not_found');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (!isConnected) {
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
                Inicio
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-white pulse-glow" />
                <div>
                  <h1 className="text-xl font-bold text-white">DeFiCred</h1>
                  <p className="text-xs text-white/60">Dashboard</p>
                </div>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Bienvenida */}
        <div className="mb-12 fade-in-up">
          <h2 className="text-5xl font-bold text-white mb-3">Bienvenido de vuelta</h2>
          <p className="text-xl text-white/70">Gestiona tus préstamos y crédito</p>
        </div>

        {/* Estado de cuenta */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Identidad */}
          <div className="glass-card group hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Identidad</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                {dniUploaded ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <FileText className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <div>
              <p className="text-white/70 mb-6">
                {loading 
                  ? "Cargando..."
                  : !dniUploaded 
                    ? "Paso 1: Subir DNI"
                    : userStatus === 'pending' 
                      ? "DNI en revisión"
                      : userStatus === 'approved'
                        ? "DNI aprobado"
                        : "DNI rechazado"
                }
              </p>
              {loading ? (
                <div className="btn-secondary w-full text-center block opacity-50">
                  Cargando...
                </div>
              ) : !dniUploaded ? (
                <a href="/onboarding" className="btn-primary w-full text-center block">
                  Subir DNI
                </a>
              ) : (
                <a href="/dashboard/identity" className="btn-secondary w-full text-center block">
                  Gestionar Identidad
                </a>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="glass-card group hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Credit Score</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/70 mb-6">Paso 2: Obtén tu score</p>
              <a href="/dashboard/score" className="btn-primary w-full text-center block">
                Calcular Score
              </a>
            </div>
          </div>

          {/* Préstamos */}
          <div className="glass-card group hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Mis Préstamos</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/70 mb-6">Paso 3: Pide tu préstamo</p>
              <a href="/dashboard/borrow" className="btn-primary w-full text-center block">
                Solicitar Préstamo
              </a>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="glass-card">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-300" />
            Acciones Rápidas
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <a href="/dashboard/borrow" className="btn-primary text-center py-6 text-lg flex items-center justify-center space-x-2">
              <DollarSign className="w-6 h-6" />
              <span>Solicitar Préstamo</span>
            </a>
            <a href="/admin" className="btn-secondary text-center py-6 text-lg flex items-center justify-center space-x-2">
              <Shield className="w-6 h-6" />
              <span>Panel Admin</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}


