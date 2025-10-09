'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useContractRead, useWaitForTransaction } from 'wagmi';
import WalletManager from '@/components/WalletManager';
import Link from 'next/link';
import { Shield, ArrowLeft, TrendingUp } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { creditScoringABI } from '@/config/abis';
import { CREDIT_SCORING_ADDRESS } from '@/config/contracts';
import toast from 'react-hot-toast';

export default function ScorePage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificar si viene del botón mock
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mock') === 'true') {
        setUseMock(true);
        // Guardar en localStorage para persistir
        localStorage.setItem('defiCred_mockScore', 'true');
        // Limpiar URL
        window.history.replaceState({}, '', '/dashboard/score');
      } else {
        // Verificar si ya hay score mock guardado
        const hasMockScore = localStorage.getItem('defiCred_mockScore');
        if (hasMockScore === 'true') {
          setUseMock(true);
        }
      }
    }
  }, []);

  // Leer score
  const { data: scoreData, refetch } = useContractRead({
    address: CREDIT_SCORING_ADDRESS as `0x${string}`,
    abi: creditScoringABI,
    functionName: 'getScore',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Calcular score
  const { write: calculateScore, data: calcData } = useContractWrite({
    address: CREDIT_SCORING_ADDRESS as `0x${string}`,
    abi: creditScoringABI,
    functionName: 'calculateInitialScore',
    args: address ? [address] : undefined,
  });

  const { isLoading: isCalculating } = useWaitForTransaction({
    hash: calcData?.hash,
    onSuccess: () => {
      toast.success('¡Score calculado exitosamente!');
      refetch();
    },
  });

  // Score mock para demo
  const mockScore = 300;
  const mockMaxLoan = 300;
  
  // Solo usar mock si no hay datos reales del blockchain O si se activó mock
  const hasRealScore = scoreData && Number(scoreData[0]) > 0 && !useMock;
  const score = hasRealScore ? Number(scoreData[0]) : (useMock ? mockScore : 0);
  const maxLoan = hasRealScore ? Number(scoreData[1]) / 1e6 : (useMock ? mockMaxLoan : 0);

  if (!mounted) {
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
                <h1 className="text-xl font-bold text-white">Credit Score</h1>
              </div>
            </div>
            <WalletManager />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        {!mounted || !isConnected ? (
          <div className="glass-card text-center py-20">
            <h2 className="text-3xl font-bold text-white mb-6">
              {!mounted ? 'Cargando...' : 'Inicia sesión para continuar'}
            </h2>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score actual */}
            <div className="glass-card text-center">
              <h3 className="text-2xl font-bold text-white mb-8">Tu Credit Score</h3>

              {score > 0 ? (
                <div>
                  <div className="mb-8">
                    <p className="text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                      {score}
                    </p>
                    <p className="text-white/70 text-xl">de 1000 puntos</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/10 p-6 rounded-xl">
                      <p className="text-white/70 mb-2">Límite de Crédito</p>
                      <p className="text-3xl font-bold text-white">${maxLoan.toFixed(2)}</p>
                      <p className="text-white/50 text-sm">USDC</p>
                    </div>
                    <div className="bg-white/10 p-6 rounded-xl">
                      <p className="text-white/70 mb-2">Clasificación</p>
                      <p className="text-3xl font-bold text-white">
                        {score < 400 ? 'Básico' : score < 700 ? 'Bueno' : 'Excelente'}
                      </p>
                    </div>
                  </div>

                  <Link href="/dashboard/borrow" className="btn-primary w-full text-center block">
                    Solicitar Préstamo →
                  </Link>
                </div>
              ) : (
                <div className="py-12">
                  <TrendingUp className="w-20 h-20 text-white/30 mx-auto mb-6" />
                  <p className="text-white/70 mb-8 text-lg">
                    Aún no tienes un score calculado
                  </p>
                  <p className="text-white/50 text-sm mb-8">
                    Asegúrate de haber creado tu identidad y que esté verificada
                  </p>
                  <button
                    onClick={() => {
                      // Score mock para evitar problemas de transacción
                      toast.success('¡Score calculado! (Modo Demo)');
                      // Simular que el score se calculó y mostrar datos mock
                      setTimeout(() => {
                        // Forzar actualización con datos mock
                        window.location.href = '/dashboard/score?mock=true';
                      }, 1000);
                    }}
                    disabled={isCalculating}
                    className="btn-primary"
                  >
                    {isCalculating ? 'Calculando Score...' : 'Calcular Mi Score (Demo)'}
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="glass-card">
              <h4 className="text-lg font-bold text-white mb-4">¿Cómo se calcula tu score?</h4>
              <div className="space-y-3 text-white/70 text-sm">
                <p>• <span className="text-purple-300 font-semibold">40%</span> - Nivel de verificación</p>
                <p>• <span className="text-blue-300 font-semibold">30%</span> - Cantidad de documentos</p>
                <p>• <span className="text-pink-300 font-semibold">30%</span> - Antigüedad de cuenta</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
