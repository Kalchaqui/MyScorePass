'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Upload, CheckCircle, Clock } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [userStatus, setUserStatus] = useState<string>('');

  const walletAddress = address;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar estado del usuario
  useEffect(() => {
    if (walletAddress) {
      fetch(`http://localhost:3001/api/users/status/${walletAddress}`)
        .then(res => res.json())
        .then(data => {
          if (data.exists) {
            setUserStatus(data.status);
            if (data.status === 'approved') {
              router.push('/dashboard');
            }
          }
        })
        .catch(console.error);
    }
  }, [walletAddress, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDniFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!dniFile || !walletAddress) {
      toast.error('Falta información');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('dni', dniFile);
    formData.append('privyUserId', walletAddress || ''); // Usando wallet como ID
    formData.append('walletAddress', walletAddress);
    formData.append('email', '');

    try {
      const response = await fetch('http://localhost:3001/api/users/upload-dni', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('¡DNI subido exitosamente!');
        setUserStatus('pending');
      } else {
        console.error('Backend error:', data);
        toast.error(data.error || 'Error al subir DNI');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Error de conexión. Verifica que el backend esté corriendo.');
    } finally {
      setUploading(false);
    }
  };

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <AnimatedBackground />
        <div className="glass-card text-center py-20 max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6">Conecta tu Wallet</h2>
          <ConnectButton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-white" />
              <h1 className="text-xl font-bold text-white">Verificación de Identidad</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        {userStatus === 'pending' ? (
          <div className="glass-card text-center py-20">
            <Clock className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold text-white mb-4">Verificación Pendiente</h2>
            <p className="text-white/70 mb-6">
              Tu DNI está siendo revisado por un administrador.
              <br />
              Te notificaremos cuando esté aprobado.
            </p>
            <Link href="/dashboard" className="btn-secondary inline-block">
              Volver al Dashboard
            </Link>
          </div>
        ) : userStatus === 'rejected' ? (
          <div className="glass-card text-center py-20 border-2 border-red-500/50">
            <h2 className="text-3xl font-bold text-white mb-4">Solicitud Rechazada</h2>
            <p className="text-white/70">
              Tu documentación no pudo ser verificada. Contacta soporte para más información.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Instrucciones */}
            <div className="glass-card">
              <h3 className="text-2xl font-bold text-white mb-4">Sube tu DNI</h3>
              <p className="text-white/70 mb-6">
                Para verificar tu identidad, necesitamos una foto clara de tu DNI o documento de identidad.
              </p>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>✅ Asegúrate que la foto esté clara y legible</li>
                <li>✅ El documento debe estar completo en la imagen</li>
                <li>✅ Formato: JPG, PNG (máx 10MB)</li>
              </ul>
            </div>

            {/* Upload */}
            <div className="glass-card">
              <label className="block">
                <div className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  preview ? 'border-green-500/50 bg-green-500/10' : 'border-white/30 hover:border-white/50'
                }`}>
                  {preview ? (
                    <div>
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto mb-4 rounded-lg" />
                      <p className="text-white">Click para cambiar imagen</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-16 h-16 text-white/50 mx-auto mb-4" />
                      <p className="text-white mb-2">Click para subir tu DNI</p>
                      <p className="text-white/50 text-sm">o arrastra el archivo aquí</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {dniFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary w-full mt-6"
                >
                  {uploading ? 'Subiendo...' : 'Enviar DNI para Verificación'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
