'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction, useDisconnect } from 'wagmi';
import WalletManager from '@/components/WalletManager';
import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { identityRegistryABI } from '@/config/abis';
import { IDENTITY_REGISTRY_ADDRESS } from '@/config/contracts';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [userAddress, setUserAddress] = useState('');
  const [level, setLevel] = useState('2');
  const [mounted, setMounted] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const ADMIN_ADDRESS = '0x6ceffA0beE387C7c58bAb3C81e17D32223E68718';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar usuarios pendientes
  useEffect(() => {
    if (address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
      loadPendingUsers();
    }
  }, [address]);

  const loadPendingUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users/pending');
      const data = await response.json();
      if (data.success) {
        setPendingUsers(data.pending);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleApprove = async (userId: number, approved: boolean, level: number = 2) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          approved,
          verificationLevel: level,
          adminAddress: address
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(approved ? '✅ Usuario aprobado' : '❌ Usuario rechazado');
        loadPendingUsers(); // Recargar lista
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  // Verificar identidad
  const { write: verifyIdentity, data: verifyData } = useContractWrite({
    address: IDENTITY_REGISTRY_ADDRESS as `0x${string}`,
    abi: [
      {
        "inputs": [
          {"name": "_user", "type": "address"},
          {"name": "_level", "type": "uint256"}
        ],
        "name": "verifyIdentity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    functionName: 'verifyIdentity',
    args: [userAddress as `0x${string}`, BigInt(level)],
  });

  const { isLoading: isVerifying } = useWaitForTransaction({
    hash: verifyData?.hash,
    onSuccess: () => {
      toast.success('¡Usuario verificado!');
      setUserAddress('');
    },
  });

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
                <Shield className="w-8 h-8 text-white pulse-glow" />
                <h1 className="text-xl font-bold text-white">Panel Admin</h1>
              </div>
            </div>
            <WalletManager />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-40 pb-20">
        {!isConnected ? (
          <div className="glass-card text-center py-20">
            <h2 className="text-3xl font-bold text-white mb-6">Conecta tu Wallet de Admin</h2>
            <WalletManager />
          </div>
        ) : address?.toLowerCase() !== ADMIN_ADDRESS.toLowerCase() ? (
          <div className="glass-card text-center py-20">
            <h2 className="text-3xl font-bold text-white mb-4">🔒 Acceso Denegado</h2>
            <p className="text-white/70 mb-4">
              Esta página es solo para administradores.
            </p>
            <p className="text-white/50 text-sm mb-6">
              Wallet conectada: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className="text-white/50 text-sm mb-6">
              Wallet admin requerida: {ADMIN_ADDRESS.slice(0, 6)}...{ADMIN_ADDRESS.slice(-4)}
            </p>
            <div className="space-y-3">
              <p className="text-white/70 text-sm">
                Para acceder como admin:
              </p>
              <ol className="text-white/50 text-sm space-y-1 text-left max-w-md mx-auto">
                <li>1. Desconecta tu wallet actual</li>
                <li>2. Conecta la wallet admin</li>
                <li>3. Recarga la página</li>
              </ol>
              <button 
                onClick={() => disconnect()}
                className="btn-secondary mt-4"
              >
                Desconectar Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Usuarios Pendientes */}
            <div className="glass-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-yellow-400" />
                  Usuarios Pendientes ({pendingUsers.length})
                </h3>
                <button onClick={loadPendingUsers} className="btn-secondary text-sm">
                  Actualizar
                </button>
              </div>

              {pendingUsers.length === 0 ? (
                <p className="text-white/70 text-center py-8">
                  No hay usuarios pendientes de verificación
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="bg-white/10 p-6 rounded-xl">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Info del usuario */}
                        <div>
                          <p className="text-white font-bold mb-2">Usuario #{user.id}</p>
                          <p className="text-white/70 text-sm mb-1">Email: {user.email}</p>
                          <p className="text-white/70 text-sm mb-1">
                            Wallet: {user.walletAddress.slice(0,6)}...{user.walletAddress.slice(-4)}
                          </p>
                          <p className="text-white/70 text-sm">
                            Fecha: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* DNI Image */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-white/70 text-sm mb-2">Frente del DNI:</p>
                            <img 
                              src={`http://localhost:3001${user.dniFrontUrl}`}
                              alt="Frente DNI"
                              className="w-full h-48 object-cover rounded-lg border-2 border-white/20"
                            />
                          </div>
                          <div>
                            <p className="text-white/70 text-sm mb-2">Reverso del DNI:</p>
                            <img 
                              src={`http://localhost:3001${user.dniBackUrl}`}
                              alt="Reverso DNI"
                              className="w-full h-48 object-cover rounded-lg border-2 border-white/20"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <button
                          onClick={() => handleApprove(user.id, true, 2)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          ✅ Aprobar (Nivel 2)
                        </button>
                        <button
                          onClick={() => handleApprove(user.id, false)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          ❌ Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verificar Usuario Manual (backup) */}
            <div className="glass-card">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
                Verificar Usuario
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Dirección del Usuario
                  </label>
                  <input
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="0x..."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Nivel de Verificación
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="input-field"
                  >
                    <option value="1">Nivel 1 - Básico (DNI)</option>
                    <option value="2">Nivel 2 - Medio (DNI + Documentos)</option>
                    <option value="3">Nivel 3 - Completo (Todos los docs)</option>
                  </select>
                </div>

                <button
                  onClick={() => verifyIdentity?.()}
                  disabled={!userAddress || isVerifying}
                  className="btn-primary w-full"
                >
                  {isVerifying ? 'Verificando...' : 'Verificar Usuario'}
                </button>
              </div>
            </div>

            {/* Verificación Rápida (Tu Wallet) */}
            <div className="glass-card bg-purple-500/20 border-2 border-purple-500/50">
              <h4 className="text-lg font-bold text-white mb-4">⚡ Verificación Rápida</h4>
              <p className="text-white/70 mb-4 text-sm">Verifica tu propia wallet para hacer pruebas:</p>
              <button
                onClick={() => {
                  setUserAddress(address || '');
                  setLevel('2');
                }}
                className="btn-secondary w-full"
              >
                Auto-rellenar Mi Wallet
              </button>
            </div>

            {/* Instrucciones */}
            <div className="glass-card">
              <h4 className="text-lg font-bold text-white mb-4">📋 Cómo Usar:</h4>
              <ol className="space-y-2 text-white/70 text-sm">
                <li>1️⃣ Usuario crea identidad en /dashboard/identity</li>
                <li>2️⃣ Tú (admin) verificas aquí con su wallet address</li>
                <li>3️⃣ Usuario calcula score en /dashboard/score</li>
                <li>4️⃣ Usuario solicita préstamo en /dashboard/borrow</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
