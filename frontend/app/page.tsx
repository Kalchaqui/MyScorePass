'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Building2, BarChart3, Lock, Zap, CheckCircle2, ArrowRight, ArrowUpRight } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import SplashScreen from '@/components/SplashScreen';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('myscorepass-splash-seen');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('myscorepass-splash-seen', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-950 font-sans selection:bg-purple-500/30">
      <AnimatedBackground />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MyScorePass</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login?mode=login"
              className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/login?mode=register"
              className="px-5 py-2.5 text-sm font-medium bg-white text-slate-950 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              Comenzar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Nueva API v2.0 Disponible
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Infraestructura de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Scoring Crediticio Web3
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-10 leading-relaxed animate-fade-in-up delay-200">
            Conectamos la reputación financiera traidicional con DeFi. Una API robusta para exchanges y bancos que requieren validación de crédito confiable, rápida y compliant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              Solicitar Acceso
              <ArrowUpRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-lg transition-all flex items-center justify-center"
            >
              Ver Documentación
            </Link>
          </div>

          {/* Trusted By / Stats */}
          <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up delay-500">
            {[
              { label: 'Usuarios Verificados', value: '100+' },
              { label: 'Validaciones / seg', value: '50k' },
              { label: 'Uptime Garantizado', value: '99.9%' },
              { label: 'Networks', value: 'Avalanche' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative z-10 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Building2 className="w-6 h-6 text-blue-400" />,
                title: "Institucional",
                desc: "Diseñado para bancos y exchanges. Cumplimiento normativo y seguridad de grado empresarial desde el primer día."
              },
              {
                icon: <Zap className="w-6 h-6 text-purple-400" />,
                title: "Pagos x402",
                desc: "Integración nativa con protocolo x402. Pagos por uso (Pay-per-call) utilizando USDC en Avalanche C-Chain."
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-pink-400" />,
                title: "Data Verificable",
                desc: "Scores generados a partir de múltiples fuentes on-chain y off-chain, verificables criptográficamente."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors group">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Snippet / Technical Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">Integración simple y poderosa</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Nuestra API RESTful se integra en minutos con tu stack existente. SDKs disponibles para TypeScript, Python y Go.
            </p>
            <ul className="space-y-4">
              {[
                "Autenticación segura vía JWT",
                "Webhooks para eventos de cambio de score",
                "Entorno de Sandbox con datos mockeados",
                "Soporte técnico 24/7"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-xl animate-pulse" />
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0F1117] shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ml-2 text-xs text-slate-500 font-mono">api-client.ts</span>
              </div>
              <div className="p-6 font-mono text-sm overflow-x-auto">
                <div className="text-purple-400">const <span className="text-white">client</span> = <span className="text-blue-400">new</span> <span className="text-yellow-300">MyScorePass</span>({'{'}</div>
                <div className="pl-4 text-slate-400">apiKey: <span className="text-green-400">'sk_live_...'</span>,</div>
                <div className="pl-4 text-slate-400">chain: <span className="text-green-400">'avalanche'</span></div>
                <div className="text-purple-400">{'}'});</div>
                <br />
                <div className="text-slate-500">// Consultar score de usuario</div>
                <div className="text-purple-400">const <span className="text-white">score</span> = <span className="text-blue-400">await</span> <span className="text-white">client</span>.<span className="text-blue-300">getScore</span>({'{'}</div>
                <div className="pl-4 text-slate-400">userId: <span className="text-green-400">'user_123'</span></div>
                <div className="text-purple-400">{'}'});</div>
                <br />
                <div className="text-blue-400">console<span className="text-white">.</span><span className="text-blue-300">log</span><span className="text-white">(</span>score<span className="text-white">);</span></div>
                <div className="text-slate-500 mt-2">{'// { creditScore: 750, risk: "low", ... }'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-slate-900/50 border border-white/10 backdrop-blur-md">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Comienza a operar con datos reales
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Únete a los exchanges líderes que ya están utilizando MyScorePass para minimizar riesgos y maximizar oportunidades.
            </p>
            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-950 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all transform hover:scale-105"
            >
              Crear Cuenta Gratuita
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 relative z-10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <div>© 2025 MyScorePass. Todos los derechos reservados.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
