'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import WalletManager from '@/components/WalletManager';
import Link from 'next/link';
import { ArrowLeft, TestTube, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { 
  IDENTITY_REGISTRY_ADDRESS, 
  CREDIT_SCORING_ADDRESS, 
  LENDING_POOL_ADDRESS, 
  LOAN_MANAGER_ADDRESS, 
  USDC_ADDRESS 
} from '@/config/contracts';
import { 
  identityRegistryABI, 
  creditScoringABI, 
  lendingPoolABI, 
  loanManagerABI, 
  usdcABI 
} from '@/config/abis';
import toast from 'react-hot-toast';

export default function TestPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [selectedContract, setSelectedContract] = useState('creditScoring');
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Contract addresses mapping
  const contractAddresses = {
    identityRegistry: IDENTITY_REGISTRY_ADDRESS,
    creditScoring: CREDIT_SCORING_ADDRESS,
    lendingPool: LENDING_POOL_ADDRESS,
    loanManager: LOAN_MANAGER_ADDRESS,
    usdc: USDC_ADDRESS
  };

  const contractABIs = {
    identityRegistry: identityRegistryABI,
    creditScoring: creditScoringABI,
    lendingPool: lendingPoolABI,
    loanManager: loanManagerABI,
    usdc: usdcABI
  };

  // Test functions for each contract
  const testFunctions = {
    creditScoring: {
      read: {
        name: 'getScore',
        description: 'Obtener score del usuario',
        args: address ? [address] : undefined
      },
      write: {
        name: 'calculateInitialScore',
        description: 'Calcular score inicial',
        args: address ? [address] : undefined
      }
    },
    identityRegistry: {
      read: {
        name: 'getIdentity',
        description: 'Obtener información de identidad del usuario',
        args: address ? [address] : undefined
      },
      write: {
        name: 'createIdentity',
        description: 'Crear identidad para el usuario (⚠️ Solo si no existe)',
        args: []
      }
    },
    lendingPool: {
      read: {
        name: 'getAvailableLiquidity',
        description: 'Obtener liquidez disponible',
        args: []
      },
      write: {
        name: 'deposit',
        description: 'Depositar fondos (⚠️ Requiere aprobar USDC primero)',
        args: ['1000000'] // 1 USDC
      }
    },
    loanManager: {
      read: {
        name: 'loanCount',
        description: 'Obtener número total de préstamos',
        args: []
      },
      write: {
        name: 'requestLoan',
        description: 'Solicitar préstamo (requiere score)',
        args: ['100000000', '3'] // 100 USDC, 3 cuotas
      }
    },
    usdc: {
      read: {
        name: 'balanceOf',
        description: 'Obtener balance USDC del usuario',
        args: address ? [address] : undefined
      },
      write: {
        name: 'faucet',
        description: 'Obtener USDC del faucet (1000 USDC)',
        args: ['1000000000'] // 1000 USDC
      }
    }
  };

  // Contract read hook
  const { data: readData, refetch: refetchRead, isLoading: isReading } = useContractRead({
    address: contractAddresses[selectedContract as keyof typeof contractAddresses] as `0x${string}`,
    abi: contractABIs[selectedContract as keyof typeof contractABIs] as any,
    functionName: testFunctions[selectedContract as keyof typeof testFunctions].read.name as any,
    args: testFunctions[selectedContract as keyof typeof testFunctions].read.args,
    enabled: !!address && !!testFunctions[selectedContract as keyof typeof testFunctions].read.args,
  });

  // Contract write hook
  const { write: contractWrite, data: writeData, isLoading: isWriting } = useContractWrite({
    address: contractAddresses[selectedContract as keyof typeof contractAddresses] as `0x${string}`,
    abi: contractABIs[selectedContract as keyof typeof contractABIs] as any,
    functionName: testFunctions[selectedContract as keyof typeof testFunctions].write.name as any,
    args: testFunctions[selectedContract as keyof typeof testFunctions].write.args,
  });

  // Approve USDC hook
  const { write: approveWrite, data: approveData } = useContractWrite({
    address: USDC_ADDRESS as `0x${string}`,
    abi: usdcABI,
    functionName: 'approve',
    args: [LENDING_POOL_ADDRESS as `0x${string}`, BigInt('1000000')], // 1 USDC
  });

  // Wait for transaction
  const { isLoading: isWaiting } = useWaitForTransaction({
    hash: writeData?.hash,
    onSuccess: (data) => {
      toast.success('Transacción exitosa!');
      setTestResult(`✅ Write exitoso: ${data.transactionHash}`);
      refetchRead();
    },
    onError: (error) => {
      // Manejar errores específicos
      if (error.message.includes('Already exists')) {
        toast.error('Ya existe una identidad para esta wallet');
        setTestResult(`⚠️ Ya existe: La identidad ya fue creada anteriormente`);
      } else if (error.message.includes('Insufficient allowance')) {
        toast.error('Aprobación insuficiente de USDC');
        setTestResult(`❌ Aprobación insuficiente: Necesitas aprobar USDC primero`);
      } else {
        toast.error('Error en transacción');
        setTestResult(`❌ Write falló: ${error.message}`);
      }
    },
  });

  // Wait for approve transaction
  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash,
    onSuccess: (data) => {
      toast.success('USDC aprobado exitosamente!');
      setTestResult(`✅ USDC aprobado: ${data.transactionHash}`);
    },
    onError: (error) => {
      toast.error('Error al aprobar USDC');
      setTestResult(`❌ Approve falló: ${error.message}`);
    },
  });

  const handleRead = () => {
    if (!address) {
      toast.error('Conecta tu wallet primero');
      return;
    }
    refetchRead();
    setTestResult(`📖 Read ejecutado para ${selectedContract}`);
  };

  const handleWrite = async () => {
    if (!address) {
      toast.error('Conecta tu wallet primero');
      return;
    }
    if (!contractWrite) {
      toast.error('No se puede conectar con el contrato');
      return;
    }

    // Para LendingPool deposit, permitir que se ejecute (el contrato manejará el error si no hay aprobación)
    // Removemos la restricción para que los jueces puedan probar directamente

    contractWrite();
    setTestResult(`✍️ Write ejecutado para ${selectedContract}`);
  };

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
              <Link href="/" className="flex items-center text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Inicio
              </Link>
              <div className="flex items-center space-x-2">
                <TestTube className="w-8 h-8 text-white" />
                <h1 className="text-xl font-bold text-white">Test de Smart Contracts</h1>
              </div>
            </div>
            <WalletManager />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-40 pb-20">
        {!isConnected ? (
          <div className="glass-card text-center py-20">
            <h2 className="text-3xl font-bold text-white mb-6">Conecta tu Wallet</h2>
            <p className="text-white/70 mb-8">Necesitas conectar tu wallet para probar los contratos</p>
            <WalletManager />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Contract Selector */}
            <div className="glass-card">
              <h3 className="text-2xl font-bold text-white mb-6">Seleccionar Contrato</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(contractAddresses).map(([key, address]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedContract(key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedContract === key
                        ? 'border-blue-400 bg-blue-400/20 text-white'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                    }`}
                  >
                    <div className="text-sm font-bold mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs font-mono break-all">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Interface */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Read Test */}
              <div className="glass-card">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
                  Read Test
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/70 text-sm mb-2">Función:</p>
                    <p className="text-white font-mono text-sm">
                      {testFunctions[selectedContract as keyof typeof testFunctions].read.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-2">Descripción:</p>
                    <p className="text-white text-sm">
                      {testFunctions[selectedContract as keyof typeof testFunctions].read.description}
                    </p>
                  </div>
                  <button
                    onClick={handleRead}
                    disabled={isReading}
                    className="btn-primary w-full"
                  >
                    {isReading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Leyendo...
                      </div>
                    ) : (
                      'Ejecutar Read'
                    )}
                  </button>
                  {readData && (
                    <div className="bg-white/10 p-4 rounded-xl">
                      <p className="text-white/70 text-sm mb-2">Resultado:</p>
                      <div className="text-white font-mono text-sm break-all">
                        {Array.isArray(readData) ? (
                          <div className="space-y-1">
                            {readData.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-white/70">[{index}]:</span>
                                <span>{typeof item === 'bigint' ? item.toString() : String(item)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>
                            {typeof readData === 'bigint' ? (readData as bigint).toString() : String(readData as any)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Write Test */}
              <div className="glass-card">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2 text-orange-400" />
                  Write Test
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/70 text-sm mb-2">Función:</p>
                    <p className="text-white font-mono text-sm">
                      {testFunctions[selectedContract as keyof typeof testFunctions].write.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-2">Descripción:</p>
                    <p className="text-white text-sm">
                      {testFunctions[selectedContract as keyof typeof testFunctions].write.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={handleWrite}
                      disabled={isWriting || isWaiting}
                      className="btn-secondary w-full"
                    >
                      {isWriting || isWaiting ? (
                        <div className="flex items-center justify-center">
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          {isWriting ? 'Enviando...' : 'Esperando...'}
                        </div>
                      ) : (
                        'Ejecutar Write'
                      )}
                    </button>
                    
                    {selectedContract === 'lendingPool' && (
                      <button
                        onClick={() => {
                          if (!address) {
                            toast.error('Conecta tu wallet primero');
                            return;
                          }
                          if (!approveWrite) {
                            toast.error('No se puede conectar con el contrato USDC');
                            return;
                          }
                          approveWrite();
                        }}
                        disabled={isApproving}
                        className="btn-primary w-full text-sm"
                      >
                        {isApproving ? (
                          <div className="flex items-center justify-center">
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Aprobando...
                          </div>
                        ) : (
                          'Aprobar USDC Primero'
                        )}
                      </button>
                    )}
                  </div>
                  {writeData && (
                    <div className="bg-white/10 p-4 rounded-xl">
                      <p className="text-white/70 text-sm mb-2">Hash de transacción:</p>
                      <p className="text-white font-mono text-sm break-all">
                        {writeData.hash}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="glass-card">
                <h4 className="text-xl font-bold text-white mb-4">Resultado de Prueba</h4>
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-white">{testResult}</p>
                </div>
              </div>
            )}

            {/* Contract Info */}
            <div className="glass-card">
              <h4 className="text-xl font-bold text-white mb-4">Información del Contrato</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-white/70 text-sm mb-2">Contrato seleccionado:</p>
                  <p className="text-white font-bold capitalize">
                    {selectedContract.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-2">Dirección:</p>
                  <p className="text-white font-mono text-sm break-all">
                    {contractAddresses[selectedContract as keyof typeof contractAddresses]}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-2">Red:</p>
                  <p className="text-white">Paseo Asset Hub (Testnet)</p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="glass-card">
              <h4 className="text-xl font-bold text-white mb-4">⚠️ Notas Importantes</h4>
              <div className="space-y-3 text-sm text-white/70">
                <div className="flex items-start space-x-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>IdentityRegistry:</strong> Solo puedes crear una identidad por wallet. Si ya existe, verás error "Already exists".</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>LendingPool:</strong> Para depositar, primero debes aprobar USDC usando el botón "Aprobar USDC Primero".</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>LoanManager:</strong> Para solicitar préstamo, necesitas tener un score calculado primero.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>USDC:</strong> El faucet te da 1000 USDC para pruebas.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
