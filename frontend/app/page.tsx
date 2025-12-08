'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, CreditCard, Zap, ArrowRight, Building2 } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Si ya está autenticado, redirigir a dashboard
    if (isAuthenticated()) {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header flotante */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-2 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                MyScorePass
              </span>
            </div>
            <Link href="/login" className="btn-primary">
              Access
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12 fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="w-16 h-16 text-cyan-400 mr-4" />
            <h1 className="text-6xl md:text-7xl font-bold text-white">
              MyScorePass
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-white/80 mb-4">
            Credit Scoring Infrastructure for Exchanges and Banks
          </p>
          <p className="text-lg text-white/60 mb-8">
            Access our mock user database with verifiable credit scores.
            <br />
            Pay with USDC via x402 and query users in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2">
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mt-12">
          <div className="glass-card p-6 group hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/50">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mock Database</h3>
            <p className="text-white/70">
              100 users with credit scores and verifiable identities for testing and development.
            </p>
          </div>

          <div className="glass-card p-6 group hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/50">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">x402 Payments</h3>
            <p className="text-white/70">
              Purchase prepaid subscriptions with USDC using Avalanche's x402 protocol.
            </p>
          </div>

          <div className="glass-card p-6 group hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-400/50">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-Time API</h3>
            <p className="text-white/70">
              Query mock users with automatic credit consumption for each query.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16 glass-card p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Are you an Exchange or Bank?
          </h2>
          <p className="text-white/70 mb-6">
            Sign up and start querying our mock user database.
            <br />
            Price: 0.02 USDC per credit (minimum 10 credits = 0.2 USDC)
          </p>
          <Link href="/login" className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2">
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
