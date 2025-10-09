'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useContractRead, useWaitForTransaction } from 'wagmi';
import { parseUnits } from 'ethers';
import WalletManager from '@/components/WalletManager';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Shield, ArrowLeft, DollarSign, Calendar, TrendingDown, Info, Sparkles, Zap, Clock } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { creditScoringABI, loanManagerABI, usdcABI } from '@/config/abis';
import { CREDIT_SCORING_ADDRESS, LOAN_MANAGER_ADDRESS, USDC_ADDRESS } from '@/config/contracts';

export default function BorrowPage() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<number>(6);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Leer score real del usuario
  const { data: scoreData } = useContractRead({
    address: CREDIT_SCORING_ADDRESS as `0x${string}`,
    abi: creditScoringABI,
    functionName: 'getScore',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Calcular score automáticamente
  const { write: calculateScore, data: calculateData } = useContractWrite({
    address: CREDIT_SCORING_ADDRESS as `0x${string}`,
    abi: creditScoringABI,
    functionName: 'calculateInitialScore',
    args: address ? [address] : undefined,
  });

  // Esperar a que se complete el cálculo de score
  const { isLoading: isCalculating } = useWaitForTransaction({
    hash: calculateData?.hash,
    onSuccess: () => {
      toast.success('¡Score calculado! Solicitando préstamo automáticamente...');
      refetchScore(); // Actualizar los datos del score
      // Automáticamente solicitar préstamo después de 2 segundos
      setTimeout(() => {
        if (requestLoan && amount) {
          console.log('Solicitando préstamo automáticamente después del score...');
          requestLoan();
        }
      }, 2000);
    },
    onError: (error) => {
      console.error('Error al calcular score:', error);
      toast.error('Error al calcular score. Intenta nuevamente.');
    },
  });

  // Calcular score real si es necesario
  const { write: calculateRealScore, data: calcRealData } = useContractWrite({
    address: CREDIT_SCORING_ADDRESS as `0x${string}`,
    abi: creditScoringABI,
    functionName: 'calculateInitialScore',
    args: address ? [address] : undefined,
  });

  const { isLoading: isCalculatingReal } = useWaitForTransaction({
    hash: calcRealData?.hash,
    onSuccess: () => {
      toast.success('Score calculado en blockchain. Solicitando préstamo...');
      // Después de calcular el score, solicitar el préstamo
      setTimeout(() => {
        if (requestLoan && amount) {
          requestLoan();
        }
      }, 2000);
    },
  });

  // Solicitar préstamo
  const { write: requestLoan, data: loanData } = useContractWrite({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'requestLoan',
    args: [
      parseUnits(amount || '0', 6),
      BigInt(selectedPlan)
    ],
  });

  const { isLoading: isRequesting } = useWaitForTransaction({
    hash: loanData?.hash,
    onSuccess: () => toast.success('¡Préstamo aprobado! Revisa tu wallet'),
  });

  // Score mock para demo (evitar problemas de transacción)
  const mockScore = 300; // Score básico
  const mockMaxLoan = 300; // $300 máximo
  
  // Verificar si hay score mock en localStorage
  const hasMockScore = typeof window !== 'undefined' && localStorage.getItem('defiCred_mockScore') === 'true';
  
  const userScore = (scoreData && Number(scoreData[0]) > 0) ? Number(scoreData[0]) : (hasMockScore ? mockScore : 0);
  const maxLoanAmount = (scoreData && Number(scoreData[0]) > 0) ? Number(scoreData[1]) / 1e6 : (hasMockScore ? mockMaxLoan : 0);

  // Auto-calcular score deshabilitado para evitar bucles
  // useEffect(() => {
  //   if (address && scoreData && userScore === 0 && calculateScore) {
  //     console.log('Auto-calculando score para usuario verificado...');
  //     calculateScore();
  //   }
  // }, [address, scoreData, userScore, calculateScore]);

  // Calcular cuota según plan seleccionado
  const calculateInstallment = (principal: number, installments: number) => {
    const rates: { [key: number]: number } = {
      1: 0.05,   // 5%
      3: 0.08,   // 8%
      6: 0.12,   // 12%
      12: 0.18   // 18%
    };
    
    const rate = rates[installments] || 0.12;
    const interest = (principal * rate * installments) / 12;
    const total = principal + interest;
    return { installment: total / installments, total, interest };
  };

  if (!mounted) {
    return null;
  }

  const loanAmount = parseFloat(amount) || 0;
  const { installment, total, interest } = calculateInstallment(loanAmount, selectedPlan);

  const plans = [
    { 
      installments: 1, 
      rate: 5, 
      label: 'Express', 
      icon: Zap,
      color: 'from-green-500 to-emerald-600',
      description: 'Pago único en 30 días'
    },
    { 
      installments: 3, 
      rate: 8, 
      label: 'Flexible', 
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
      description: '3 pagos mensuales'
    },
    { 
      installments: 6, 
      rate: 12, 
      label: 'Equilibrado', 
      icon: TrendingDown,
      color: 'from-purple-500 to-pink-600',
      description: '6 pagos mensuales',
      recommended: true
    },
    { 
      installments: 12, 
      rate: 18, 
      label: 'Cómodo', 
      icon: Calendar,
      color: 'from-orange-500 to-red-600',
      description: '12 pagos mensuales'
    }
  ];

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-white" />
                <h1 className="text-xl font-bold text-white">Solicitar Préstamo</h1>
              </div>
            </div>
            <WalletManager />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        
        {/* Información del usuario */}
        <div className="glass-card mb-8 fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Tu Capacidad de Crédito</h3>
              <p className="text-white/70">Basado en tu score de {userScore}/1000</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Límite disponible</p>
              <p className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                ${maxLoanAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="glass-card fade-in-up">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <DollarSign className="w-7 h-7 mr-2" />
              Monto del Préstamo
            </h3>

            {/* Input de monto */}
            <div className="mb-8">
              <label className="text-white/70 text-sm mb-2 block">¿Cuánto necesitas?</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  max={maxLoanAmount}
                  className="input-field text-2xl font-bold pl-10 pr-4"
                />
              </div>
              <p className="text-white/50 text-sm mt-2">
                Máximo: ${maxLoanAmount.toLocaleString()} USDC
                {hasMockScore && <span className="text-blue-400 ml-2">(Modo Demo)</span>}
              </p>
            </div>

            {/* Selector de planes */}
            <div className="mb-8">
              <label className="text-white/70 text-sm mb-4 block flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Selecciona tu plan de pago
              </label>
              <div className="space-y-3">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  return (
                    <div
                      key={plan.installments}
                      onClick={() => setSelectedPlan(plan.installments)}
                      className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedPlan === plan.installments
                          ? 'border-white/60 bg-white/20 scale-105'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Recomendado</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${plan.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-bold">{plan.label}</p>
                            <p className="text-white/60 text-sm">{plan.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{plan.rate}%</p>
                          <p className="text-white/60 text-xs">APY</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botón de solicitud */}
            {userScore === 0 && !hasMockScore ? (
              <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-xl">
                <p className="text-white text-center mb-3">⚠️ Score Requerido</p>
                <p className="text-white/70 text-sm text-center mb-4">
                  Necesitas calcular tu score antes de solicitar un préstamo.
                </p>
                <Link href="/dashboard/score" className="btn-primary w-full text-center block">
                  Ir a Calcular Score →
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  console.log('Solicitando préstamo:', { amount, selectedPlan, address, userScore, hasMockScore });
                  if (!amount) {
                    toast.error('Por favor ingresa un monto');
                    return;
                  }
                  
                  // Si solo tenemos score mock, necesitamos calcular el score real primero
                  if (hasMockScore && (!scoreData || Number(scoreData[0]) === 0)) {
                    toast('Calculando score en blockchain...', { icon: '⏳' });
                    if (calculateRealScore && address) {
                      console.log('Calculando score real para:', address);
                      calculateRealScore();
                    } else {
                      toast.error('Error: No se puede calcular score sin dirección de wallet');
                    }
                    return;
                  }
                  
                  if (!requestLoan) {
                    toast.error('Error: No se puede conectar con el contrato');
                    return;
                  }
                  try {
                    requestLoan();
                  } catch (error) {
                    console.error('Error al solicitar préstamo:', error);
                    toast.error('Error al solicitar préstamo');
                  }
                }}
                disabled={!amount || loanAmount > maxLoanAmount || isRequesting || isCalculating || isCalculatingReal}
                className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating || isCalculatingReal ? 'Calculando Score...' : isRequesting ? 'Procesando...' : 'Solicitar Préstamo'}
              </button>
            )}
          </div>

          {/* Resumen */}
          <div className="space-y-6">
            {/* Calculadora */}
            <div className="glass-card fade-in-up">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Info className="w-6 h-6 mr-2" />
                Resumen del Préstamo
              </h3>

              {loanAmount > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/70">Monto solicitado</span>
                    <span className="text-white font-bold text-xl">${loanAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/70">Plan seleccionado</span>
                    <span className="text-white font-bold">
                      {selectedPlan === 1 ? 'Pago único' : `${selectedPlan} cuotas`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/70">Tasa de interés</span>
                    <span className="text-white font-bold">
                      {plans.find(p => p.installments === selectedPlan)?.rate}% APY
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/70">Interés total</span>
                    <span className="text-white font-bold">${interest.toFixed(2)}</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 p-4 rounded-xl mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">
                        {selectedPlan === 1 ? 'Total a pagar' : 'Cuota mensual'}
                      </span>
                      <span className="text-3xl font-black text-white">
                        ${installment.toFixed(2)}
                      </span>
                    </div>
                    {selectedPlan > 1 && (
                      <p className="text-white/70 text-sm mt-2">
                        Total: ${total.toFixed(2)} en {selectedPlan} pagos
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">Ingresa un monto para ver el resumen</p>
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="glass-card fade-in-up">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                Información Importante
              </h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Sin colateral requerido</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Aprobación instantánea basada en tu score</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Pagos mensuales con 7 días de gracia</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Mejora tu score pagando a tiempo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Puedes pagar anticipadamente sin penalización</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

