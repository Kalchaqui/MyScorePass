'use client';

import { useAccount } from 'wagmi';
import WalletManager from '@/components/WalletManager';
import Link from 'next/link';
import { FileText, TrendingUp, Users, Shield, Sparkles, Lock, Zap } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Image from 'next/image';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header flotante */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="w-10 h-10 text-white pulse-glow" />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DeFiCred</h1>
                <p className="text-xs text-white/70">Powered by Polkadot</p>
              </div>
            </div>
            <WalletManager />
          </div>
        </div>
      </header>

      {/* Hero Section - Espectacular */}
      <section className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full mb-8 border border-white/20">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-sm font-semibold">NERDCONF Hackathon 2025</span>
          </div>

          <h2 className="text-7xl md:text-8xl font-black mb-6 text-white leading-tight">
            Préstamos
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sin Colateral
            </span>
          </h2>
          
          <p className="text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Tu <span className="font-bold text-purple-300">identidad</span> y{' '}
            <span className="font-bold text-blue-300">reputación</span> son tu garantía.
            <br />
            Accede a financiamiento descentralizado de forma innovadora.
          </p>

          {isConnected ? (
            <Link href="/dashboard" className="btn-primary text-xl inline-flex items-center space-x-2">
              <Shield className="w-6 h-6" />
              <span>Ir al Dashboard</span>
              <Sparkles className="w-5 h-5" />
            </Link>
          ) : (
            <div className="space-y-4">
              <p className="text-white/70 text-lg">Conecta tu wallet para comenzar</p>
              <div className="flex justify-center">
                <WalletManager />
              </div>
            </div>
          )}

          {/* Stats flotantes */}
          <div className="grid grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
            <div className="glass-card text-center">
              <div className="stat-number">$1M+</div>
              <div className="text-white/70 font-semibold">Total Prestado</div>
            </div>
            <div className="glass-card text-center">
              <div className="stat-number">500+</div>
              <div className="text-white/70 font-semibold">Usuarios</div>
            </div>
            <div className="glass-card text-center">
              <div className="stat-number">95%</div>
              <div className="text-white/70 font-semibold">Tasa Repago</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-5xl font-bold text-white mb-4">¿Cómo funciona?</h3>
            <p className="text-xl text-white/70">Tres simples pasos para acceder a crédito</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="glass-card text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
              <h4 className="text-2xl font-bold mb-3 text-white">1. Verifica tu Identidad</h4>
              <p className="text-white/70 leading-relaxed">
                Carga tu DNI y documentos para crear tu perfil único con{' '}
                <span className="text-purple-300 font-semibold">Proof of Humanity</span>
              </p>
            </div>

            {/* Paso 2 */}
            <div className="glass-card text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-600 mx-auto mb-4"></div>
              <h4 className="text-2xl font-bold mb-3 text-white">2. Obtén tu Score</h4>
              <p className="text-white/70 leading-relaxed">
                Nuestro sistema calcula tu{' '}
                <span className="text-blue-300 font-semibold">score crediticio</span> basado en
                verificación y documentos de forma automática
              </p>
            </div>

            {/* Paso 3 */}
            <div className="glass-card text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-orange-600 mx-auto mb-4"></div>
              <h4 className="text-2xl font-bold mb-3 text-white">3. Solicita Préstamos</h4>
              <p className="text-white/70 leading-relaxed">
                Accede a préstamos en <span className="text-green-300 font-semibold">USDC/USDT</span>{' '}
                según tu score, sin colateral tradicional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-4xl font-bold text-white mb-6">
                  Construido en <span className="text-purple-300">Polkadot</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold text-lg">Seguridad Máxima</h4>
                      <p className="text-white/70">Smart contracts auditados en Paseo testnet</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold text-lg">Rápido y Eficiente</h4>
                      <p className="text-white/70">Transacciones en segundos con fees mínimas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Lock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold text-lg">Totalmente Descentralizado</h4>
                      <p className="text-white/70">Sin intermediarios, tú tienes el control</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-64 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20"></div>
                <Image
                  src="/deficred.png"
                  alt="DeFiCred"
                  fill
                  className="object-contain p-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-5xl font-bold text-white mb-6">
            ¿Listo para comenzar?
          </h3>
          <p className="text-xl text-white/70 mb-12">
            Únete a la revolución del crédito descentralizado
          </p>
          {!isConnected && (
            <div className="flex justify-center">
              <WalletManager />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-card mx-4 mb-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">DeFiCred</span>
          </div>
          <p className="text-white/70">© 2025 DeFiCred - Construido en Polkadot para NERDCONF Hackathon</p>
          <p className="text-sm text-white/50 mt-2">Paseo Testnet • Scoring Descentralizado</p>
        </div>
      </footer>
    </main>
  );
}


