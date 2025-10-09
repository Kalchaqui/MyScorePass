'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletManager from '@/components/WalletManager';
import Link from 'next/link';
import { Shield, ArrowLeft, DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function LoansPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Datos de préstamos simulados (reemplazar cuando contratos estén desplegados)
  const loans = [
    {
      id: 1,
      amount: 1000,
      installments: 6,
      paidInstallments: 2,
      installmentAmount: 176.67,
      nextPayment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // en 15 días
      status: 'active',
      rate: 12
    },
    {
      id: 2,
      amount: 500,
      installments: 3,
      paidInstallments: 3,
      installmentAmount: 173.33,
      status: 'repaid',
      rate: 8
    }
  ];

  const activeLoan = loans.find(l => l.status === 'active');

  if (!mounted) {
    return null;
  }

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
                <h1 className="text-xl font-bold text-white">Mis Préstamos</h1>
              </div>
            </div>
            <WalletManager />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        
        {/* Préstamo activo */}
        {activeLoan && (
          <div className="glass-card mb-8 fade-in-up border-2 border-yellow-400/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center pulse-glow">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Préstamo Activo</h3>
                  <p className="text-white/70">Próximo pago en {Math.ceil((activeLoan.nextPayment.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Préstamo #{activeLoan.id}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-white/70 text-sm mb-2">
                <span>Progreso de pagos</span>
                <span>{activeLoan.paidInstallments}/{activeLoan.installments} cuotas</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                  style={{ width: `${(activeLoan.paidInstallments / activeLoan.installments) * 100}%` }}
                />
              </div>
            </div>

            {/* Detalles */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-white/70 text-sm mb-1">Monto original</p>
                <p className="text-2xl font-bold text-white">${activeLoan.amount.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-white/70 text-sm mb-1">Cuota mensual</p>
                <p className="text-2xl font-bold text-white">${activeLoan.installmentAmount.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-white/70 text-sm mb-1">Tasa de interés</p>
                <p className="text-2xl font-bold text-white">{activeLoan.rate}% APY</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-white/70 text-sm mb-1">Cuotas restantes</p>
                <p className="text-2xl font-bold text-white">
                  {activeLoan.installments - activeLoan.paidInstallments}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="grid md:grid-cols-2 gap-4">
              <button className="btn-primary py-4">
                Pagar Cuota (${activeLoan.installmentAmount.toFixed(2)})
              </button>
              <button className="btn-secondary py-4">
                Pagar Todo (${((activeLoan.installments - activeLoan.paidInstallments) * activeLoan.installmentAmount).toFixed(2)})
              </button>
            </div>
          </div>
        )}

        {/* Historial de préstamos */}
        <div className="glass-card fade-in-up">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Historial de Préstamos
          </h3>

          {loans.length > 0 ? (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className={`p-4 rounded-xl ${loan.status === 'active' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5 border border-white/10'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {loan.status === 'active' ? (
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      )}
                      <div>
                        <p className="text-white font-bold">Préstamo #{loan.id}</p>
                        <p className="text-white/70 text-sm">
                          ${loan.amount} USDC • {loan.installments} cuotas • {loan.rate}% APY
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${loan.status === 'active' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {loan.status === 'active' ? 'Activo' : 'Completado'}
                      </p>
                      <p className="text-white/70 text-sm">
                        {loan.status === 'active' 
                          ? `${loan.paidInstallments}/${loan.installments} pagado`
                          : 'Pagado totalmente'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 mb-6">No tienes préstamos aún</p>
              <Link href="/dashboard/borrow" className="btn-primary inline-block">
                Solicitar tu Primer Préstamo
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

