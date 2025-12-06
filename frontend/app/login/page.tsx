'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Building2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { login, register } from '@/lib/auth';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    walletAddress: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login exitoso');
        router.push('/dashboard');
      } else {
        if (!formData.name) {
          toast.error('El nombre es requerido');
          setLoading(false);
          return;
        }
        await register(formData.email, formData.password, formData.name, formData.walletAddress || undefined);
        toast.success('Registro exitoso');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al autenticarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-8 fade-in-up">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              MyScorePass
            </h1>
            <p className="text-white/70">
              {isLogin ? 'Acceso para Exchanges' : 'Registro de Exchange'}
            </p>
          </div>

          {/* Formulario */}
          <div className="glass-card p-8 fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre del Exchange/Banco
                  </label>
                  <input
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: Binance Argentina"
                  />
                </div>
              )}

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="tu@exchange.com"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Wallet Address (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0x..."
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                {isLogin ? (
                  <>¿No tienes cuenta? <span className="text-purple-400 font-medium">Regístrate</span></>
                ) : (
                  <>¿Ya tienes cuenta? <span className="text-purple-400 font-medium">Inicia sesión</span></>
                )}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-white/60 text-sm">
            <p>Acceso exclusivo para exchanges, bancos e instituciones financieras</p>
          </div>
        </div>
      </div>
    </main>
  );
}
