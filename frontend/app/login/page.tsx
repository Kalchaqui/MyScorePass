'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { usePrivy, syncPrivyUser } from '@/lib/auth';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [syncing, setSyncing] = useState(false);

  // Sincronizar con backend cuando Privy autentica
  useEffect(() => {
    if (ready && authenticated && user && !syncing) {
      syncWithBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated, user]);

  const syncWithBackend = async () => {
    if (!user) return;
    
    setSyncing(true);
    try {
      // Obtener email del usuario de Privy
      const email = user.email?.address || user.google?.email || user.twitter?.email;
      if (!email) {
        toast.error('No se pudo obtener el email del usuario');
        logout();
        return;
      }

      // Obtener nombre si está disponible
      const name = user.email?.name || user.google?.name || user.twitter?.name || email.split('@')[0];
      
      // Sincronizar con backend
      await syncPrivyUser(user.id, email, name);
      
      toast.success('Autenticación exitosa');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error syncing with backend:', error);
      toast.error(error.message || 'Error al sincronizar con el backend');
      logout();
    } finally {
      setSyncing(false);
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
    }
  };

  // Si ya está autenticado, mostrar loading mientras sincroniza
  if (authenticated && syncing) {
    return (
      <main className="min-h-screen relative">
        <AnimatedBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-white/70">Sincronizando con el backend...</p>
          </div>
        </div>
      </main>
    );
  }

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
              Acceso para Exchanges
            </p>
          </div>

          {/* Botón de Privy Login */}
          <div className="glass-card p-8 fade-in-up">
            {!ready ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-white/70">Cargando...</p>
              </div>
            ) : authenticated ? (
              <div className="text-center">
                <p className="text-white mb-4">Ya estás autenticado</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full btn-primary py-3"
                >
                  Ir al Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  disabled={!ready}
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                >
                  <span>Iniciar Sesión / Registrarse</span>
                </button>
                <p className="text-white/60 text-sm text-center">
                  Ingresa tu email. Si no tienes cuenta, se creará automáticamente.
                </p>
              </div>
            )}
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
