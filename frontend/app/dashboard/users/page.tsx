'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, Users, Search, Filter, Coins, User, X, Mail, Wallet, Award } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getCurrentExchange, isAuthenticated, getAuthHeaders } from '@/lib/auth';
import { Exchange } from '@/lib/auth';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BasicUser {
  id: number;
  name: string;
  dni: string;
}

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
  const [users, setUsers] = useState<BasicUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    minScore: '',
    maxScore: '',
    verificationLevel: '',
    name: '',
  });

  // Limpiar resultados cuando cambian los filtros
  useEffect(() => {
    setUsers([]);
  }, [filters.name, filters.minScore, filters.maxScore, filters.verificationLevel]);

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

    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (filters.minScore) params.append('minScore', filters.minScore);
      if (filters.maxScore) params.append('maxScore', filters.maxScore);
      if (filters.verificationLevel) params.append('verificationLevel', filters.verificationLevel);
      if (filters.name) params.append('name', filters.name);

      // Usar el endpoint de búsqueda que NO consume créditos
      const response = await fetch(`${API_URL}/api/mockUsers/search?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search users');
      }

      const data = await response.json();
      console.log('Resultados de búsqueda:', data);
      console.log('Usuarios encontrados:', data.users);
      setUsers(data.users);
      
      if (data.users.length === 0) {
        toast('No users found with the specified filters', { icon: 'ℹ️' });
      }
    } catch (error: any) {
      console.error('Error en búsqueda:', error);
      toast.error(error.message || 'Error searching users');
    } finally {
      setSearching(false);
    }
  };

  const viewUserDetails = async (userId: number) => {
    if (!exchange) return;

    console.log('Ver detalles del usuario con ID:', userId);

    if (exchange.credits < 1) {
      toast.error('You do not have enough credits. Buy more credits to view user details.');
      router.push('/dashboard/subscription');
      return;
    }

    setViewingDetails(true);
    try {
      console.log('Llamando a:', `${API_URL}/api/mockUsers/${userId}`);
      const response = await fetch(`${API_URL}/api/mockUsers/${userId}`, {
        headers: getAuthHeaders(),
      });
      
      console.log('Response status:', response.status);

      if (response.status === 402) {
        const error = await response.json();
        toast.error('You do not have enough credits');
        router.push('/dashboard/subscription');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch user details');
      }

      const data = await response.json();
      setSelectedUser(data.user);
      setShowModal(true);
      
      // Actualizar exchange con nuevos créditos
      const updatedExchange = await getCurrentExchange();
      setExchange(updatedExchange);
      
      // Mostrar mensaje de éxito solo después de ver los detalles
      toast.success(`Query successful. Remaining credits: ${data.creditsRemaining}`);
    } catch (error: any) {
      toast.error(error.message || 'Error fetching user details');
    } finally {
      setViewingDetails(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen relative">
        <AnimatedBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
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
                <span>credits</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-40">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">User Database</h2>
          <p className="text-white/70">Query mock users. Click "View" to see full details (consumes 1 credit)</p>
        </div>

        {/* Filtros */}
        <div className="glass-card mb-6 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Search Filters
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Name</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="Search by name"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Min Score</label>
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
              <label className="block text-white/70 text-sm mb-2">Max Score</label>
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
              <label className="block text-white/70 text-sm mb-2">Verification Level</label>
              <select
                value={filters.verificationLevel}
                onChange={(e) => setFilters({ ...filters, verificationLevel: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All</option>
                <option value="0">Level 0</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
              </select>
            </div>
          </div>
          <button
            onClick={searchUsers}
            disabled={searching || !exchange}
            className="mt-4 btn-primary flex items-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>{searching ? 'Searching...' : 'Query Users'}</span>
          </button>
        </div>

        {/* Lista de usuarios */}
        {users.length > 0 && (
          <div className="glass-card">
            <h3 className="text-xl font-bold text-white mb-4">Results ({users.length})</h3>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="bg-white/5 rounded-lg p-4 border border-white/10 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-lg font-bold text-white">{user.name}</h4>
                      <p className="text-sm text-white/70">ID: {user.dni}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => viewUserDetails(user.id)}
                    disabled={viewingDetails || !exchange || exchange.credits < 1}
                    className="btn-secondary px-4 py-2 flex items-center space-x-2"
                  >
                    {viewingDetails ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>View</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {users.length === 0 && !searching && (
          <div className="glass-card text-center py-12">
            <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">Use the filters to query users</p>
            <p className="text-white/50 text-sm mt-2">Click "View" to see full details (consumes 1 credit)</p>
          </div>
        )}
      </div>

      {/* Modal de detalles del usuario */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">User Details</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información básica */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="w-6 h-6 text-purple-400" />
                  <h4 className="text-xl font-bold text-white">{selectedUser.identity.name}</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">ID:</span>
                    <p className="text-white font-medium">{selectedUser.identity.dni}</p>
                  </div>
                  <div>
                    <span className="text-white/70">Verification Level:</span>
                    <p className="text-white font-medium">Level {selectedUser.identity.verificationLevel}</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-white/70 font-medium">Email</span>
                </div>
                <p className="text-white">{selectedUser.identity.email}</p>
              </div>

              {/* Score */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-green-400" />
                  <span className="text-white/70 font-medium">Score</span>
                </div>
                <p className="text-3xl font-bold text-green-400">{selectedUser.score}</p>
              </div>

              {/* Wallet */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet className="w-5 h-5 text-purple-400" />
                  <span className="text-white/70 font-medium">Wallet Address</span>
                </div>
                <p className="text-white font-mono text-sm break-all">{selectedUser.walletAddress}</p>
              </div>

              {/* Fecha de creación */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <span className="text-white/70 text-sm">Created at:</span>
                <p className="text-white text-sm">{new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
