'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useContractRead, useWaitForTransaction } from 'wagmi';
import WalletManager from '@/components/WalletManager';
import Link from 'next/link';
import { Shield, ArrowLeft, FileText, CheckCircle, Clock } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { identityRegistryABI } from '@/config/abis';
import { IDENTITY_REGISTRY_ADDRESS } from '@/config/contracts';
import toast from 'react-hot-toast';

export default function IdentityPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [userStatus, setUserStatus] = useState<string>('');
  const [dniUploaded, setDniUploaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar estado del DNI
  useEffect(() => {
    if (address && mounted && isConnected) {
      checkUserStatus();
    }
  }, [address, mounted, isConnected]);

  const checkUserStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking user status for address:', address);
      const response = await fetch(`http://localhost:3001/api/users/status/${address}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('User status data:', data);
        setUserStatus(data.status || 'not_found');
        setDniUploaded(data.status !== 'not_found');
      } else {
        console.log('Response not ok, setting not_found');
        setUserStatus('not_found');
        setDniUploaded(false);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUserStatus('not_found');
      setDniUploaded(false);
      setError('Error conectando con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Leer identidad
  const { data: identityData, refetch } = useContractRead({
    address: IDENTITY_REGISTRY_ADDRESS as `0x${string}`,
    abi: identityRegistryABI,
    functionName: 'getIdentity',
    args: address ? [address] : undefined,
    enabled: !!address && mounted,
  });

  // Crear identidad
  const { write: createIdentity, data: createData } = useContractWrite({
    address: IDENTITY_REGISTRY_ADDRESS as `0x${string}`,
    abi: identityRegistryABI,
    functionName: 'createIdentity',
  });

  const { isLoading: isCreating } = useWaitForTransaction({
    hash: createData?.hash,
    onSuccess: () => {
      toast.success('¡Identidad creada!');
      refetch();
    },
  });

  const hasIdentity = identityData && identityData[0] !== '0x0000000000000000000000000000000000000000000000000000000000000000';
  const isVerified = identityData ? identityData[1] : false;
  const verificationLevel = identityData ? Number(identityData[2]) : 0;
  const documentCount = identityData ? Number(identityData[4]) : 0;

  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return null;
  }

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-white" />
                <h1 className="text-xl font-bold text-white">Mi Identidad</h1>
              </div>
            </div>
            <WalletManager />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        {!isConnected ? (
          <div className="glass-card text-center py-20">
            <h2 className="text-3xl font-bold text-white mb-6">Inicia sesión para continuar</h2>
            <p className="text-white/70">Vuelve a la página principal</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estado actual */}
            <div className="glass-card">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Estado de tu Identidad
              </h3>

              {hasIdentity ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-white font-bold text-lg">Identidad Creada</p>
                      <p className="text-white/70 text-sm">ID único generado on-chain</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 p-4 rounded-xl">
                      <p className="text-white/70 text-sm">Estado</p>
                      <p className="text-white font-bold">
                        {isVerified ? '✅ Verificado' : '⏳ Pendiente'}
                      </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                      <p className="text-white/70 text-sm">Nivel</p>
                      <p className="text-white font-bold">{verificationLevel}/3</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                      <p className="text-white/70 text-sm">Documentos</p>
                      <p className="text-white font-bold">{documentCount}</p>
                    </div>
                  </div>

                  {!isVerified && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-xl mt-6">
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold">Verificación Pendiente</p>
                          <p className="text-white/70 text-sm">
                            Un administrador debe verificar tu identidad. Para la demo, el admin puede verificarte desde Remix.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isVerified && (
                    <Link href="/dashboard/score" className="btn-primary w-full text-center block mt-6">
                      Siguiente: Calcular Score →
                    </Link>
                  )}
                </div>
              ) : (
                <div>
                  {loading ? (
                    <div className="space-y-4">
                      <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-semibold">Verificando Estado</p>
                            <p className="text-white/70 text-sm">
                              Cargando información de tu DNI...
                            </p>
                          </div>
                        </div>
                      </div>
                      <button disabled className="btn-secondary w-full opacity-50">
                        Cargando...
                      </button>
                    </div>
                  ) : error ? (
                    <div className="space-y-4">
                      <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-semibold">Error de Conexión</p>
                            <p className="text-white/70 text-sm">
                              {error}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={checkUserStatus}
                        className="btn-secondary w-full"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : !dniUploaded ? (
                    <div className="space-y-4">
                      <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-semibold">DNI Requerido</p>
                            <p className="text-white/70 text-sm">
                              Primero debes subir tu DNI para crear tu identidad.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link href="/onboarding" className="btn-primary w-full text-center block">
                        Subir DNI Primero →
                      </Link>
                    </div>
                  ) : userStatus === 'pending' ? (
                    <div className="space-y-4">
                      <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-semibold">DNI Pendiente de Aprobación</p>
                            <p className="text-white/70 text-sm">
                              Tu DNI está siendo revisado por un administrador. Espera la aprobación antes de crear tu identidad.
                            </p>
                          </div>
                        </div>
                      </div>
                      <button disabled className="btn-secondary w-full opacity-50">
                        Esperando Aprobación del Admin
                      </button>
                    </div>
                  ) : userStatus === 'approved' ? (
                    <div className="space-y-4">
                      <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-semibold">DNI Aprobado</p>
                            <p className="text-white/70 text-sm">
                              Tu DNI ha sido verificado. Ahora puedes crear tu identidad en la blockchain.
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/70 mb-6">
                        Crea tu identidad única en la blockchain. Esto genera un Proof of Humanity único para ti.
                      </p>
                      <button
                        onClick={() => createIdentity?.()}
                        disabled={isCreating}
                        className="btn-primary w-full"
                      >
                        {isCreating ? 'Creando Identidad...' : 'Crear Mi Identidad'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-semibold">DNI Rechazado</p>
                            <p className="text-white/70 text-sm">
                              Tu DNI fue rechazado. Contacta al administrador o sube un nuevo documento.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link href="/onboarding" className="btn-primary w-full text-center block">
                        Subir Nuevo DNI →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instrucciones */}
            <div className="glass-card">
              <h4 className="text-lg font-bold text-white mb-4">📋 Flujo Completo:</h4>
              <ol className="space-y-2 text-white/70 text-sm">
                <li className={!dniUploaded ? 'text-yellow-400 font-semibold' : 'text-green-400'}>
                  1️⃣ {!dniUploaded ? '⏳ Subir DNI' : '✅ DNI Subido'}
                </li>
                <li className={userStatus !== 'approved' ? 'text-yellow-400 font-semibold' : 'text-green-400'}>
                  2️⃣ {userStatus === 'pending' ? '⏳ Esperar aprobación admin' : userStatus === 'approved' ? '✅ DNI Aprobado' : '❌ DNI Rechazado'}
                </li>
                <li className={!hasIdentity ? 'text-yellow-400 font-semibold' : 'text-green-400'}>
                  3️⃣ {!hasIdentity ? '⏳ Crear identidad' : '✅ Identidad Creada'}
                </li>
                <li className={!isVerified ? 'text-yellow-400 font-semibold' : 'text-green-400'}>
                  4️⃣ {!isVerified ? '⏳ Verificar identidad' : '✅ Identidad Verificada'}
                </li>
                <li className="text-white/50">
                  5️⃣ Calcular score
                </li>
                <li className="text-white/50">
                  6️⃣ Solicitar préstamo
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
