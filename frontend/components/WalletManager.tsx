'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletManager() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisconnect = () => {
    try {
      disconnect();
      
      // Limpiar todo el cache de wallets
      if (typeof window !== 'undefined') {
        // Limpiar todas las claves relacionadas con wallets
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('wagmi') || 
            key.includes('rainbowkit') || 
            key.includes('metamask') ||
            key.includes('wallet') ||
            key.includes('connector')
          )) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Recargar página para forzar nueva conexión
        setTimeout(() => {
          window.location.reload();
        }, 200);
      }
    } catch (error) {
      console.error('Error al desconectar:', error);
      // Si hay error, al menos recargar la página
      window.location.reload();
    }
  };

  if (!mounted) {
    return <ConnectButton />;
  }

  return (
    <div className="flex items-center space-x-4">
      <ConnectButton />
      {isConnected && (
        <div className="flex items-center space-x-2">
          <span className="text-white/70 text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button
            onClick={handleDisconnect}
            className="btn-secondary text-xs px-3 py-1"
            title="Desconectar y limpiar cache"
          >
            Cambiar
          </button>
        </div>
      )}
    </div>
  );
}
