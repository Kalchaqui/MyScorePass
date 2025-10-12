'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import WalletManager from '@/components/WalletManager';
import Link from 'next/link';
import { Shield, ArrowLeft, DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { loanManagerABI, usdcABI } from '@/config/abis';
import { LOAN_MANAGER_ADDRESS, USDC_ADDRESS } from '@/config/contracts';
import toast from 'react-hot-toast';

export default function LoansPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [userLoans, setUserLoans] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Leer préstamos del contrato usando múltiples llamadas
  const [loadingLoans, setLoadingLoans] = useState(false);

  // Leer préstamos individuales (aumentar a 10 para capturar más préstamos)
  const { data: loan0 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(0)],
    enabled: !!address && mounted,
  });

  const { data: loan1 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(1)],
    enabled: !!address && mounted,
  });

  const { data: loan2 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(2)],
    enabled: !!address && mounted,
  });

  const { data: loan3 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(3)],
    enabled: !!address && mounted,
  });

  const { data: loan4 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(4)],
    enabled: !!address && mounted,
  });

  const { data: loan5 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(5)],
    enabled: !!address && mounted,
  });

  const { data: loan6 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(6)],
    enabled: !!address && mounted,
  });

  const { data: loan7 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(7)],
    enabled: !!address && mounted,
  });

  const { data: loan8 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(8)],
    enabled: !!address && mounted,
  });

  const { data: loan9 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(9)],
    enabled: !!address && mounted,
  });

  const { data: loan10 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(10)],
    enabled: !!address && mounted,
  });

  const { data: loan11 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(11)],
    enabled: !!address && mounted,
  });

  const { data: loan12 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(12)],
    enabled: !!address && mounted,
  });

  const { data: loan13 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(13)],
    enabled: !!address && mounted,
  });

  const { data: loan14 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(14)],
    enabled: !!address && mounted,
  });

  const { data: loan15 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(15)],
    enabled: !!address && mounted,
  });

  const { data: loan16 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(16)],
    enabled: !!address && mounted,
  });

  const { data: loan17 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(17)],
    enabled: !!address && mounted,
  });

  const { data: loan18 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(18)],
    enabled: !!address && mounted,
  });

  const { data: loan19 } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'loans',
    args: [BigInt(19)],
    enabled: !!address && mounted,
  });

  // Definir allLoans fuera del useEffect para que esté disponible en el JSX
  const allLoans = [loan0, loan1, loan2, loan3, loan4, loan5, loan6, loan7, loan8, loan9, loan10, loan11, loan12, loan13, loan14, loan15, loan16, loan17, loan18, loan19];

  // Procesar préstamos del usuario
  useEffect(() => {
    if (!address || !mounted) return;

    const userLoansArray: any[] = [];

    console.log('Processing loans for address:', address);
    console.log('Contract address:', LOAN_MANAGER_ADDRESS);
    console.log('All loans data:', allLoans);

    allLoans.forEach((loanData, index) => {
      console.log(`Checking loan ${index}:`, loanData);
      
      if (loanData && Array.isArray(loanData) && loanData.length >= 5) {
        const borrower = loanData[0];
        const amount = loanData[1];
        const installments = loanData[2];
        const paid = loanData[3];
        const installmentAmt = loanData[4];

        console.log(`Loan ${index} details:`, {
          borrower,
          borrowerType: typeof borrower,
          borrowerLength: borrower ? borrower.length : 'N/A',
          amount: Number(amount) / 1e6,
          installments: Number(installments),
          paid: Number(paid),
          installmentAmt: Number(installmentAmt) / 1e6,
          currentAddress: address,
          currentAddressType: typeof address,
          currentAddressLength: address ? address.length : 'N/A',
          isUserLoan: borrower && borrower.toLowerCase() === address.toLowerCase(),
          borrowerLower: borrower ? borrower.toLowerCase() : 'N/A',
          addressLower: address ? address.toLowerCase() : 'N/A',
          borrowerRaw: borrower,
          addressRaw: address
        });

        // Solo incluir préstamos de la wallet actual
        if (borrower && borrower.toLowerCase() === address.toLowerCase()) {
          const processedLoan = {
            id: index, // Usar el índice real del contrato
            displayId: index + 1, // ID para mostrar en UI
            amount: Number(amount) / 1e6, // Convertir de wei a USDC
            installments: Number(installments),
            paidInstallments: Number(paid),
            installmentAmount: Number(installmentAmt) / 1e6,
            nextPayment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // en 15 días
            status: Number(paid) < Number(installments) ? 'active' : 'repaid',
            rate: 12 // Tasa fija por ahora
          };
          userLoansArray.push(processedLoan);
          console.log('✅ Added user loan:', processedLoan);
        } else {
          console.log(`❌ Loan ${index} not for current user`);
        }
      } else {
        console.log(`❌ Loan ${index} invalid data:`, loanData);
      }
    });

    console.log('Final user loans:', userLoansArray);
    setUserLoans(userLoansArray);
  }, [address, mounted, loan0, loan1, loan2, loan3, loan4, loan5, loan6, loan7, loan8, loan9, loan10, loan11, loan12, loan13, loan14, loan15, loan16, loan17, loan18, loan19]);

  const activeLoan = userLoans.find(l => l.status === 'active');

  // Hook para leer balance de USDC
  const { data: usdcBalance } = useContractRead({
    address: USDC_ADDRESS as `0x${string}`,
    abi: usdcABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address && mounted,
  });

  // Hook para aprobar USDC
  const { write: approveUSDC, data: approveData } = useContractWrite({
    address: USDC_ADDRESS as `0x${string}`,
    abi: usdcABI,
    functionName: 'approve',
  });

  // Hook para obtener USDC del faucet
  const { write: faucetUSDC, data: faucetData } = useContractWrite({
    address: USDC_ADDRESS as `0x${string}`,
    abi: usdcABI,
    functionName: 'faucet',
  });

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash,
    onSuccess: () => {
      toast.success('¡USDC aprobado! Ahora puedes pagar.');
    },
    onError: (error) => {
      console.error('Error approving USDC:', error);
      toast.error('Error al aprobar USDC');
    },
  });

  // Hook para pagar cuota
  const { write: payInstallment, data: payData } = useContractWrite({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'payInstallment',
  });

  const { isLoading: isPaying } = useWaitForTransaction({
    hash: payData?.hash,
    onSuccess: () => {
      toast.success('¡Cuota pagada exitosamente!');
      // Recargar datos
      window.location.reload();
    },
    onError: (error) => {
      console.error('Error paying installment:', error);
      toast.error('Error al pagar cuota');
    },
  });

  const { isLoading: isFauceting } = useWaitForTransaction({
    hash: faucetData?.hash,
    onSuccess: () => {
      toast.success('¡USDC obtenido del faucet!');
      // Recargar datos
      window.location.reload();
    },
    onError: (error) => {
      console.error('Error getting USDC from faucet:', error);
      toast.error('Error al obtener USDC');
    },
  });

  // Función para aprobar USDC
  const handleApproveUSDC = () => {
    if (!approveUSDC) {
      toast.error('Error: No se puede conectar con el contrato USDC');
      return;
    }
    try {
      console.log('Approving USDC for LoanManager');
      // Aprobar una cantidad grande para evitar problemas de allowance
      const maxAmount = BigInt('1000000000000000000000000'); // 1,000,000 USDC
      approveUSDC({ args: [LOAN_MANAGER_ADDRESS as `0x${string}`, maxAmount] });
    } catch (error) {
      console.error('Error al aprobar USDC:', error);
      toast.error('Error al aprobar USDC');
    }
  };

  // Función para obtener USDC del faucet
  const handleFaucetUSDC = () => {
    if (!faucetUSDC) {
      toast.error('Error: No se puede conectar con el contrato USDC');
      return;
    }
    try {
      console.log('Getting USDC from faucet');
      // El faucet requiere un monto, usar 1000 USDC (1000 * 1e6)
      const amount = BigInt('1000000000'); // 1000 USDC (1000 * 1e6 = 1,000,000,000)
      faucetUSDC({ args: [amount] });
    } catch (error) {
      console.error('Error al obtener USDC:', error);
      toast.error('Error al obtener USDC');
    }
  };

  // Función para pagar cuota
  const handlePayInstallment = (loanId: number) => {
    if (!payInstallment) {
      toast.error('Error: No se puede conectar con el contrato');
      return;
    }

    // Verificar balance de USDC
    const balance = usdcBalance ? Number(usdcBalance) / 1e6 : 0;
    const loan = userLoans.find(l => l.id === loanId);
    
    if (loan && balance < loan.installmentAmount) {
      toast.error(`Saldo insuficiente. Necesitas $${loan.installmentAmount.toFixed(2)} USDC, tienes $${balance.toFixed(2)} USDC`);
      return;
    }

    try {
      console.log('Paying installment for loan ID:', loanId);
      console.log('This corresponds to contract index:', loanId);
      console.log('USDC Balance:', balance);
      payInstallment({ args: [BigInt(loanId)] });
    } catch (error) {
      console.error('Error al pagar cuota:', error);
      toast.error('Error al pagar cuota');
    }
  };

  // Función para pagar todo (una cuota a la vez)
  const handlePayAll = (loanId: number) => {
    if (!payInstallment) {
      toast.error('Error: No se puede conectar con el contrato');
      return;
    }

    // Encontrar el préstamo para obtener las cuotas restantes
    const loan = userLoans.find(l => l.id === loanId);
    if (!loan) {
      toast.error('Error: Préstamo no encontrado');
      return;
    }

    const remainingInstallments = loan.installments - loan.paidInstallments;
    if (remainingInstallments <= 0) {
      toast.error('Este préstamo ya está pagado completamente');
      return;
    }

    try {
      console.log(`Paying installment for loan ID:`, loanId);
      console.log('This corresponds to contract index:', loanId);
      console.log(`Remaining installments: ${remainingInstallments}`);
      
      // Mostrar información sobre el pago
      toast(`Pagar cuota de $${loan.installmentAmount.toFixed(2)}. Quedan ${remainingInstallments - 1} cuotas restantes.`, { 
        icon: '💡',
        duration: 4000
      });
      
      payInstallment({ args: [BigInt(loanId)] });
      
    } catch (error) {
      console.error('Error al pagar cuota:', error);
      toast.error('Error al pagar cuota');
    }
  };

  if (!mounted) {
    return null;
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-40">
        

        {/* Historial de préstamos */}
        <div className="glass-card fade-in-up">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Historial de Préstamos
          </h3>

          {/* Debug info */}
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
            <h4 className="text-white font-bold mb-2">🔍 Debug Info:</h4>
            <div className="text-white/70 text-sm space-y-1">
              <div>Wallet: {address}</div>
              <div>Contract: {LOAN_MANAGER_ADDRESS}</div>
              <div>Total loans found: {userLoans.length}</div>
              <div>All loans data length: {allLoans.filter(Boolean).length}</div>
              <div>USDC Balance: ${usdcBalance ? (Number(usdcBalance) / 1e6).toFixed(2) : '0.00'}</div>
            </div>
            
            {/* Botones de acción */}
            <div className="mt-4 space-y-2">
              <button 
                onClick={handleFaucetUSDC}
                disabled={isFauceting}
                className="btn-secondary w-full py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFauceting ? 'Obteniendo USDC...' : '💰 Obtener USDC del Faucet'}
              </button>
              <button 
                onClick={handleApproveUSDC}
                disabled={isApproving}
                className="btn-primary w-full py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApproving ? 'Aprobando...' : '✅ Aprobar USDC'}
              </button>
            </div>
          </div>

          {loadingLoans ? (
            <div className="text-center py-12">
              <div className="text-white/70 mb-4">Cargando préstamos...</div>
            </div>
          ) : userLoans.length > 0 ? (
            <div className="space-y-4">
              {userLoans.map((loan) => (
                <div key={loan.id} className={`p-4 rounded-xl ${loan.status === 'active' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5 border border-white/10'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {loan.status === 'active' ? (
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      )}
                      <div>
                        <p className="text-white font-bold">Préstamo #{loan.displayId}</p>
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
                  
                  {/* Botones de pago para préstamos activos */}
                  {loan.status === 'active' && (
                    <div className="mt-4">
                      <div className="grid md:grid-cols-2 gap-2">
                        <button 
                          onClick={() => handlePayInstallment(loan.id)}
                          disabled={isPaying || isApproving || isFauceting}
                          className="btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPaying ? 'Procesando...' : `Pagar Cuota ($${loan.installmentAmount.toFixed(2)})`}
                        </button>
                        <button 
                          onClick={() => handlePayAll(loan.id)}
                          disabled={isPaying || isApproving || isFauceting}
                          className="btn-secondary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPaying ? 'Procesando...' : `Pagar Todo ($${loan.amount.toFixed(2)})`}
                        </button>
                      </div>
                    </div>
                  )}
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

