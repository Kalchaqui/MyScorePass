'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

/**
 * Botón personalizado para conectar Core Wallet directamente
 * Detecta Core Wallet usando window.ethereum o window.avalanche
 */
export default function CoreWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [coreWalletAvailable, setCoreWalletAvailable] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Detectar si Core Wallet está disponible
    const checkCoreWallet = () => {
      // Core Wallet puede exponerse como window.ethereum o window.avalanche
      const hasEthereum = typeof window !== 'undefined' && window.ethereum;
      const hasAvalanche = typeof window !== 'undefined' && (window as any).avalanche;
      const hasCore = typeof window !== 'undefined' && (window as any).core;
      
      // Verificar si es Core Wallet específicamente
      if (hasEthereum) {
        const provider = window.ethereum;
        // Core Wallet suele tener propiedades específicas
        const isCore = provider.isAvalanche || 
                      provider.isCore || 
                      (provider as any).isAvalancheWallet ||
                      provider.constructor.name === 'AvalancheProvider';
        
        setCoreWalletAvailable(hasEthereum || hasAvalanche || hasCore || isCore);
      } else {
        setCoreWalletAvailable(hasAvalanche || hasCore);
      }
    };

    checkCoreWallet();
    
    // Escuchar cambios en window.ethereum
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('connect', checkCoreWallet);
      return () => {
        window.ethereum?.removeListener('connect', checkCoreWallet);
      };
    }
  }, []);

  const handleConnectCore = async () => {
    try {
      // Buscar el conector injected que debería detectar Core Wallet
      const injectedConnector = connectors.find(
        (connector) => 
          connector.id === 'injected' || 
          connector.name === 'Injected' ||
          connector.name?.toLowerCase().includes('injected') ||
          connector.type === 'injected'
      );

      if (injectedConnector) {
        console.log('Conectando con conector:', injectedConnector);
        await connect({ connector: injectedConnector });
      } else {
        // Fallback: intentar conectar directamente usando window.ethereum
        if (typeof window !== 'undefined' && window.ethereum) {
          console.log('Conectando directamente con window.ethereum');
          try {
            // Solicitar cuentas
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            console.log('Cuentas obtenidas:', accounts);
            
            // Cambiar a la red correcta si es necesario
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xa869' }], // 43113 en hex para Avalanche Fuji
              });
            } catch (switchError: any) {
              // Si la red no existe, añadirla
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0xa869',
                    chainName: 'Avalanche Fuji Testnet',
                    nativeCurrency: {
                      name: 'AVAX',
                      symbol: 'AVAX',
                      decimals: 18,
                    },
                    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                    blockExplorerUrls: ['https://testnet.snowtrace.io'],
                  }],
                });
              }
            }
            
            // Recargar para que wagmi detecte la conexión
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (directError: any) {
            console.error('Error en conexión directa:', directError);
            if (directError.code === 4001) {
              alert('Conexión rechazada. Por favor, acepta la solicitud en Core Wallet.');
            } else {
              alert(`Error: ${directError.message || 'Error desconocido'}`);
            }
          }
        } else {
          alert('Core Wallet no detectado. Asegúrate de que esté instalado y activo.');
        }
      }
    } catch (error: any) {
      console.error('Error connecting Core Wallet:', error);
      if (error.code === 4001) {
        alert('Conexión rechazada. Por favor, acepta la solicitud en Core Wallet cuando aparezca el popup.');
      } else {
        alert(`Error al conectar Core Wallet: ${error.message || 'Error desconocido'}`);
      }
    }
  };

  if (!mounted) return null;

  // Si ya está conectado, no mostrar nada (WalletManager maneja esto)
  if (isConnected) {
    return null;
  }

  // Si Core Wallet está disponible, mostrar botón específico
  if (coreWalletAvailable) {
    return (
      <button
        onClick={handleConnectCore}
        disabled={isPending}
        className="btn-primary flex items-center space-x-2"
      >
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <span>🔴</span>
            <span>Conectar Core Wallet</span>
          </>
        )}
      </button>
    );
  }

  // Si no está disponible, mostrar mensaje
  return (
    <div className="text-white/70 text-sm">
      Core Wallet no detectado. Asegúrate de que esté instalado.
    </div>
  );
}

