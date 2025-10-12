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

  // Leer identidad con manejo de errores mejorado
  const { data: identityData, refetch, error: contractError } = useContractRead({
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
    onError: (error) => {
      console.error('Error creating identity:', error);
      toast.error('Error al crear identidad');
    },
  });

  // Verificaciones seguras para identityData
  const hasIdentity = identityData && Array.isArray(identityData) && identityData[0] !== '0x0000000000000000000000000000000000000000000000000000000000000000';
  const isVerified = identityData && Array.isArray(identityData) ? identityData[1] : false;
  const verificationLevel = identityData && Array.isArray(identityData) ? Number(identityData[2]) : 0;
  const documentCount = identityData && Array.isArray(identityData) ? Number(identityData[4]) : 0;

  // Debug logs
  console.log('IdentityPage - Debug:', {
    mounted,
    isConnected,
    address,
    loading,
    userStatus,
    identityData,
    contractError,
    hasIdentity,
    isVerified
  });

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Conecta tu wallet para continuar</div>
          <WalletManager />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-2 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white transition-colors">
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pt-40 pb-20">
        <div className="space-y-6">
          {/* Estado actual */}
          <div className="glass-card">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-400" />
              Estado Actual
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Wallet:</span>
                  <span className="text-white font-mono text-sm">{address}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">DNI Subido:</span>
                  <span className={dniUploaded ? 'text-green-400' : 'text-yellow-400'}>
                    {dniUploaded ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Estado Admin:</span>
                  <span className={
                    userStatus === 'approved' ? 'text-green-400' :
                    userStatus === 'pending' ? 'text-yellow-400' :
                    userStatus === 'rejected' ? 'text-red-400' :
                    'text-gray-400'
                  }>
                    {userStatus === 'approved' ? '✅ Aprobado' :
                     userStatus === 'pending' ? '⏳ Pendiente' :
                     userStatus === 'rejected' ? '❌ Rechazado' :
                     '❓ No encontrado'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Identidad:</span>
                  <span className={hasIdentity ? 'text-green-400' : 'text-yellow-400'}>
                    {hasIdentity ? '✅ Creada' : '❌ No creada'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Verificada:</span>
                  <span className={isVerified ? 'text-green-400' : 'text-yellow-400'}>
                    {isVerified ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Nivel:</span>
                  <span className="text-white">{verificationLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="glass-card">
            <h3 className="text-2xl font-bold text-white mb-6">Acciones Disponibles</h3>
            
            <div className="space-y-4">
              {!dniUploaded ? (
                <Link href="/onboarding" className="btn-primary w-full text-center block">
                  📄 Subir DNI
                </Link>
              ) : userStatus === 'pending' ? (
                <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-xl">
                  <p className="text-white text-center mb-3">⏳ Esperando Aprobación</p>
                  <p className="text-white/70 text-sm text-center">
                    Tu DNI está siendo revisado por el administrador. 
                    Recibirás una notificación cuando sea aprobado.
                  </p>
                </div>
              ) : userStatus === 'rejected' ? (
                <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl">
                  <p className="text-white text-center mb-3">❌ DNI Rechazado</p>
                  <p className="text-white/70 text-sm text-center mb-4">
                    Tu DNI fue rechazado. Por favor, contacta al administrador.
                  </p>
                  <Link href="/onboarding" className="btn-primary w-full text-center block">
                    📄 Subir DNI Nuevamente
                  </Link>
                </div>
              ) : userStatus === 'approved' && !hasIdentity ? (
                <button
                  onClick={() => {
                    if (!createIdentity) {
                      toast.error('Error: No se puede conectar con el contrato');
                      return;
                    }
                    try {
                      createIdentity();
                    } catch (error) {
                      console.error('Error al crear identidad:', error);
                      toast.error('Error al crear identidad');
                    }
                  }}
                  disabled={isCreating}
                  className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creando Identidad...' : '🏗️ Crear Identidad'}
                </button>
              ) : hasIdentity ? (
                <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl">
                  <p className="text-white text-center mb-3">✅ Identidad Completa</p>
                  <p className="text-white/70 text-sm text-center mb-4">
                    Tu identidad está creada y verificada. Puedes proceder a calcular tu score.
                  </p>
                  <Link href="/dashboard/score" className="btn-primary w-full text-center block">
                    📊 Calcular Score
                  </Link>
                </div>
              ) : null}
            </div>
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
      </div>
    </main>
  );
}