'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, Users, Search, Filter, Coins, User } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getCurrentExchange, isAuthenticated, getAuthHeaders } from '@/lib/auth';
import { Exchange } from '@/lib/auth';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MockUser {
  id: number;
  walletAddress: string;
  score: number;
  identity: {
    name: string;
    dni: string;
    email: string;
    verificationLevel: number;
  };
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    minScore: '',
    maxScore: '',
    verificationLevel: '',
    name: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const currentExchange = await getCurrentExchange();
        setExchange(currentExchange);
      } catch (error: any) {
        if (error.message === 'Session expired') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const searchUsers = async () => {
    if (!exchange) return;

    if (exchange.credits < 1) {
      toast.error('No tienes créditos suficientes. Compra más créditos para consultar usuarios.');
      router.push('/dashboard/subscription');
      return;
    }

    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (filters.minScore) params.append('minScore', filters.minScore);
      if (filters.maxScore) params.append('maxScore', filters.maxScore);
      if (filters.verificationLevel) params.append('verificationLevel', filters.verificationLevel);
      if (filters.name) params.append('name', filters.name);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_URL}/api/mockUsers?${params}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 402) {
        const error = await response.json();
        toast.error('No tienes créditos suficientes');
        router.push('/dashboard/subscription');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      
      // Actualizar exchange con nuevos créditos
      const updatedExchange = await getCurrentExchange();
      setExchange(updatedExchange);
      
      toast.success(`Consulta exitosa. Créditos restantes: ${data.creditsRemaining}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al consultar usuarios');
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen relative">
        <AnimatedBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Cargando...</div>
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
            <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                MyScorePass
              </span>
            </div>
            {exchange && (
              <div className="flex items-center space-x-2 text-white/70">
                <Coins className="w-5 h-5 text-green-400" />
                <span className="font-bold text-green-400">{exchange.credits}</span>
                <span>créditos</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-40">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Base de Datos de Usuarios</h2>
          <p className="text-white/70">Consulta usuarios mockeados (consume 1 crédito por consulta)</p>
        </div>

        {/* Filtros */}
        <div className="glass-card mb-6 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros de Búsqueda
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Nombre</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="Buscar por nombre"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Score Mínimo</label>
              <input
                type="number"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="300"
                min="300"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Score Máximo</label>
              <input
                type="number"
                value={filters.maxScore}
                onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="1000"
                min="300"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Nivel Verificación</label>
              <select
                value={filters.verificationLevel}
                onChange={(e) => setFilters({ ...filters, verificationLevel: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">Todos</option>
                <option value="0">Nivel 0</option>
                <option value="1">Nivel 1</option>
                <option value="2">Nivel 2</option>
                <option value="3">Nivel 3</option>
              </select>
            </div>
          </div>
          <button
            onClick={searchUsers}
            disabled={searching || !exchange || exchange.credits < 1}
            className="mt-4 btn-primary flex items-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>{searching ? 'Consultando...' : 'Consultar Usuarios (1 crédito)'}</span>
          </button>
        </div>

        {/* Lista de usuarios */}
        {users.length > 0 && (
          <div className="glass-card">
            <h3 className="text-xl font-bold text-white mb-4">Resultados ({users.length})</h3>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="w-5 h-5 text-purple-400" />
                        <h4 className="text-lg font-bold text-white">{user.identity.name}</h4>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                          Nivel {user.identity.verificationLevel}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-white/70">
                        <div>
                          <span className="font-medium">Wallet:</span> {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                        </div>
                        <div>
                          <span className="font-medium">DNI:</span> {user.identity.dni}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {user.identity.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{user.score}</div>
                      <div className="text-xs text-white/50">Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {users.length === 0 && !searching && (
          <div className="glass-card text-center py-12">
            <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">Usa los filtros para consultar usuarios</p>
            <p className="text-white/50 text-sm mt-2">Cada consulta consume 1 crédito</p>
          </div>
        )}
      </div>
    </main>
  );
}
