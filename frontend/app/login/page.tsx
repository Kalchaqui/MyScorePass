'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Building2, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { login, register } from '@/lib/auth';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    walletAddress: '',
  });

  // Detectar modo desde URL
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!formData.email || !formData.password) {
      toast.error('Email y contraseña son requeridos');
      return;
    }

    if (!isLogin && !formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setLoading(true);

    try {
      // Timeout de 15 segundos para evitar que se quede colgado eternamente
      const authPromise = isLogin
        ? login(formData.email, formData.password)
        : register(
          formData.email,
          formData.password,
          formData.name.trim(),
          formData.walletAddress.trim() || undefined
        );

      // Wrapper con timeout
      const result = await Promise.race([
        authPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado. El servidor no responde.')), 15000))
      ]);

      if (isLogin) {
        console.log('Login successful:', result);
        toast.success('¡Login exitoso!');
        router.push('/dashboard');
      } else {
        console.log('Registration successful:', result);
        toast.success('¡Registro exitoso!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error.message || error.toString() || 'Error al autenticarse';
      toast.error(errorMessage);
    } finally {
      // Importante: Asegurar que el estado de carga se desactiva si hay error
      // Si hay éxito, el componente se desmontará al navegar, pero por seguridad lo desactivamos
      if (document.body.contains(e.target as Node)) {
        setLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
    // Actualizar URL
    const newMode = !isLogin ? 'login' : 'register';
    router.push(`/login?mode=${newMode}`, { scroll: false });
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Ej: Binance Argentina"
                    disabled={loading}
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="tu@exchange.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="0x..."
                    disabled={loading}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                onClick={switchMode}
                disabled={loading}
                className="text-white/70 hover:text-white text-sm transition-colors disabled:opacity-50"
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

