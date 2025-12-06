'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, CreditCard, Zap, ArrowRight, Building2 } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import SplashScreen from '@/components/SplashScreen';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Si ya está autenticado, redirigir a dashboard
    if (isAuthenticated()) {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  useEffect(() => {
    const hasSeenSplash = localStorage.getItem('myscorepass-splash-seen');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    localStorage.setItem('myscorepass-splash-seen', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header flotante */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-2 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                MyScorePass
              </span>
            </div>
            <Link href="/login" className="btn-primary">
              Acceder
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12 fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="w-16 h-16 text-purple-400 mr-4" />
            <h1 className="text-6xl md:text-7xl font-bold text-white">
              MyScorePass
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-white/80 mb-4">
            Infraestructura de Scoring Crediticio para Exchanges y Bancos
          </p>
          <p className="text-lg text-white/60 mb-8">
            Accede a nuestra base de datos de usuarios mockeados con scores crediticios verificables.
            <br />
            Paga con USDC vía x402 y consulta usuarios en tiempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2">
              <span>Iniciar Sesión</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4">
              Registrarse
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mt-12">
          <div className="glass-card p-6 group hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Base de Datos Mockeada</h3>
            <p className="text-white/70">
              100 usuarios con scores crediticios e identidades verificables para testing y desarrollo.
            </p>
          </div>

          <div className="glass-card p-6 group hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pagos x402</h3>
            <p className="text-white/70">
              Compra suscripciones prepago con USDC usando el protocolo x402 de Avalanche.
            </p>
          </div>

          <div className="glass-card p-6 group hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">API en Tiempo Real</h3>
            <p className="text-white/70">
              Consulta usuarios mockeados con consumo automático de créditos por cada consulta.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16 glass-card p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Eres un Exchange o Banco?
          </h2>
          <p className="text-white/70 mb-6">
            Regístrate y comienza a consultar nuestra base de datos de usuarios mockeados.
            <br />
            Precio: 100 USDC por crédito (mínimo 1,000 USDC = 10 créditos)
          </p>
          <Link href="/login" className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2">
            <span>Empezar Ahora</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
