'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useContractRead, useWaitForTransaction } from 'wagmi';
import { parseUnits, formatUnits } from 'ethers';
import WalletManager from '@/components/WalletManager';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { creditScoringABI, loanManagerABI, usdcABI } from '@/config/abis';
import { 
  CREDIT_SCORING_ADDRESS, 
  LOAN_MANAGER_ADDRESS,
  USDC_ADDRESS 
} from '@/config/contracts';
import toast from 'react-hot-toast';

export default function DemoPage() {
  const { address, isConnected } = useAccount();
  const [loanAmount, setLoanAmount] = useState('100');
  const [installments, setInstallments] = useState(6);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Leer score del usuario
  const { data: scoreData } = useContractRead({
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

  const { isLoading: isCalcLoading } = useWaitForTransaction({
    hash: calcData?.hash,
    onSuccess: () => toast.success('¡Score calculado!'),
  });

  // Solicitar préstamo
  const { write: requestLoan, data: loanData } = useContractWrite({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'requestLoan',
    args: [
      parseUnits(loanAmount || '0', 6),
      BigInt(installments)
    ],
  });

  const { isLoading: isLoanLoading } = useWaitForTransaction({
    hash: loanData?.hash,
    onSuccess: () => toast.success('¡Préstamo aprobado!'),
  });

  // Obtener USDC del faucet
  const { write: getFaucet, data: faucetData } = useContractWrite({
    address: USDC_ADDRESS as `0x${string}`,
    abi: usdcABI,
    functionName: 'faucet',
    args: [parseUnits('1000', 6)],
  });

  const { isLoading: isFaucetLoading } = useWaitForTransaction({
    hash: faucetData?.hash,
    onSuccess: () => toast.success('¡1000 USDC recibidos!'),
  });

  const score = scoreData ? Number(scoreData[0]) : 0;
  const maxLoan = scoreData ? Number(scoreData[1]) / 1e6 : 0;

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
                <h1 className="text-xl font-bold text-white">Demo DeFiCred</h1>
              </div>
            </div>
            <WalletManager />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        {!isConnected ? (
          <div className="glass-card text-center py-20">
            <h2 className="text-3xl font-bold text-white mb-6">Conecta tu Wallet</h2>
            <WalletManager />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score */}
            <div className="glass-card">
              <h3 className="text-2xl font-bold text-white mb-4">Tu Score</h3>
              {score > 0 ? (
                <div>
                  <p className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {score}/1000
                  </p>
                  <p className="text-white/70">Límite: ${maxLoan.toFixed(2)} USDC</p>
                </div>
              ) : (
                <div>
                  <p className="text-white/70 mb-4">No tienes score aún</p>
                  <button
                    onClick={() => calculateScore?.()}
                    disabled={isCalcLoading}
                    className="btn-primary"
                  >
                    {isCalcLoading ? 'Calculando...' : 'Calcular Score'}
                  </button>
                </div>
              )}
            </div>

            {/* Obtener USDC */}
            <div className="glass-card">
              <h3 className="text-2xl font-bold text-white mb-4">Obtener USDC de Prueba</h3>
              <button
                onClick={() => getFaucet?.()}
                disabled={isFaucetLoading}
                className="btn-secondary"
              >
                {isFaucetLoading ? 'Obteniendo...' : 'Obtener 1,000 USDC'}
              </button>
            </div>

            {/* Solicitar Préstamo */}
            {score > 0 && (
              <div className="glass-card">
                <h3 className="text-2xl font-bold text-white mb-6">Solicitar Préstamo</h3>
                
                <div className="mb-4">
                  <label className="text-white/70 text-sm mb-2 block">Monto (USDC)</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    max={maxLoan}
                    className="input-field"
                    placeholder="100"
                  />
                  <p className="text-white/50 text-sm mt-1">Máximo: ${maxLoan.toFixed(2)}</p>
                </div>

                <div className="mb-6">
                  <label className="text-white/70 text-sm mb-2 block">Cuotas</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="input-field"
                  >
                    <option value={1}>1 cuota (5% APY)</option>
                    <option value={3}>3 cuotas (8% APY)</option>
                    <option value={6}>6 cuotas (12% APY)</option>
                    <option value={12}>12 cuotas (18% APY)</option>
                  </select>
                </div>

                <button
                  onClick={() => requestLoan?.()}
                  disabled={isLoanLoading || !loanAmount}
                  className="btn-primary w-full"
                >
                  {isLoanLoading ? 'Procesando...' : 'Solicitar Préstamo'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
