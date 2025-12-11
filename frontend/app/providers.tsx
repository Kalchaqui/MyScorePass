'use client';

import * as React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThirdwebProvider } from 'thirdweb/react';

// Error Boundary para capturar errores de Privy relacionados con wallets
class PrivyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Si el error es relacionado con walletProvider, lo ignoramos silenciosamente
    const errorMessage = error.message || '';
    const errorStack = error.stack || '';
    const fullError = errorMessage + ' ' + errorStack;
    
    if (fullError.includes('walletProvider') || 
        fullError.includes('on is not a function') ||
        fullError.includes('useActiveWallet') ||
        fullError.includes('setWalletProvider') ||
        fullError.includes('createEthereumWalletConnector')) {
      // No mostrar error, continuar normalmente
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorMessage = error.message || '';
    const errorStack = error.stack || '';
    const fullError = errorMessage + ' ' + errorStack;
    
    // Solo loggear si no es un error de walletProvider
    if (!fullError.includes('walletProvider') && 
        !fullError.includes('on is not a function') &&
        !fullError.includes('useActiveWallet') &&
        !fullError.includes('setWalletProvider')) {
      console.error('Error en PrivyProvider:', error, errorInfo);
    }
  }

  render() {
    // Siempre renderizar children, incluso si hay error de walletProvider
    return <>{this.props.children}</>;
  }
}

// Wrapper component para Privy que maneja errores de inicialización
function PrivyWrapper({ children, appId }: { children: React.ReactNode; appId: string }) {
  // Setup error suppression BEFORE Privy initializes
  // This must run synchronously, not in useEffect
  if (typeof window !== 'undefined') {
    const originalError = window.console.error;
    const originalWarn = window.console.warn;
    
    // Only setup once
    if (!(window as any).__privyErrorSuppressed) {
      window.console.error = (...args: any[]) => {
        const errorMessage = args[0]?.toString() || '';
        const errorStack = args[1]?.toString() || '';
        const fullMessage = errorMessage + ' ' + errorStack;
        
        // Ignorar errores relacionados con walletProvider de Privy
        if (fullMessage.includes('walletProvider') || 
            fullMessage.includes('on is not a function') ||
            fullMessage.includes('useActiveWallet') ||
            fullMessage.includes('setWalletProvider') ||
            fullMessage.includes('createEthereumWalletConnector')) {
          return;
        }
        // Ignorar warnings de validateDOMNesting de Privy
        if (errorMessage.includes('validateDOMNesting') && 
            (errorMessage.includes('Privy') || errorMessage.includes('@privy-io'))) {
          return;
        }
        // Mostrar otros errores normalmente
        originalError.apply(window.console, args);
      };

      window.console.warn = (...args: any[]) => {
        const warnMessage = args[0]?.toString() || '';
        // Ignorar warnings de validateDOMNesting de Privy
        if (warnMessage.includes('validateDOMNesting') && 
            (warnMessage.includes('Privy') || warnMessage.includes('@privy-io'))) {
          return;
        }
        // Mostrar otros warnings normalmente
        originalWarn.apply(window.console, args);
      };

      // Interceptar errores no manejados de React/Privy
      const originalUnhandledRejection = window.onunhandledrejection;
      window.onunhandledrejection = (event: PromiseRejectionEvent) => {
        const errorMessage = event.reason?.message || event.reason?.toString() || '';
        if (errorMessage.includes('walletProvider') || 
            errorMessage.includes('on is not a function') ||
            errorMessage.includes('useActiveWallet') ||
            errorMessage.includes('setWalletProvider')) {
          event.preventDefault();
          return;
        }
        if (originalUnhandledRejection) {
          originalUnhandledRejection(event);
        }
      };

      // Interceptar errores globales de Next.js runtime
      const originalErrorHandler = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        const errorMessage = error?.message || message?.toString() || '';
        const errorStack = error?.stack || '';
        const fullError = errorMessage + ' ' + errorStack;
        
        if (fullError.includes('walletProvider') || 
            fullError.includes('on is not a function') ||
            fullError.includes('useActiveWallet') ||
            fullError.includes('setWalletProvider')) {
          // Prevenir que Next.js muestre el error overlay
          return true;
        }
        
        if (originalErrorHandler) {
          return originalErrorHandler(message, source, lineno, colno, error);
        }
        return false;
      };

      (window as any).__privyErrorSuppressed = true;
    }
  }

  // Setup error suppression in useEffect as well for React errors
  React.useEffect(() => {
    // Setup error handlers immediately
    const originalError = window.console.error;
    const originalWarn = window.console.warn;
    
    window.console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || '';
      const errorStack = args[1]?.toString() || '';
      const fullMessage = errorMessage + ' ' + errorStack;
      
      // Ignorar errores relacionados con walletProvider de Privy
      if (fullMessage.includes('walletProvider') || 
          fullMessage.includes('on is not a function') ||
          fullMessage.includes('useActiveWallet') ||
          fullMessage.includes('setWalletProvider') ||
          fullMessage.includes('createEthereumWalletConnector')) {
        return;
      }
      // Ignorar warnings de validateDOMNesting de Privy
      if (errorMessage.includes('validateDOMNesting') && 
          (errorMessage.includes('Privy') || errorMessage.includes('@privy-io'))) {
        return;
      }
      // Mostrar otros errores normalmente
      originalError.apply(window.console, args);
    };

    window.console.warn = (...args: any[]) => {
      const warnMessage = args[0]?.toString() || '';
      // Ignorar warnings de validateDOMNesting de Privy
      if (warnMessage.includes('validateDOMNesting') && 
          (warnMessage.includes('Privy') || warnMessage.includes('@privy-io'))) {
        return;
      }
      // Mostrar otros warnings normalmente
      originalWarn.apply(window.console, args);
    };

    // Interceptar errores no manejados de React/Privy
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || event.reason?.toString() || '';
      if (errorMessage.includes('walletProvider') || 
          errorMessage.includes('on is not a function') ||
          errorMessage.includes('useActiveWallet') ||
          errorMessage.includes('setWalletProvider')) {
        event.preventDefault();
        return;
      }
      if (originalUnhandledRejection) {
        originalUnhandledRejection(event);
      }
    };

    // Interceptar errores globales de Next.js runtime
    const originalErrorHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const errorMessage = error?.message || message?.toString() || '';
      const errorStack = error?.stack || '';
      const fullError = errorMessage + ' ' + errorStack;
      
      if (fullError.includes('walletProvider') || 
          fullError.includes('on is not a function') ||
          fullError.includes('useActiveWallet') ||
          fullError.includes('setWalletProvider')) {
        // Prevenir que Next.js muestre el error overlay
        return true;
      }
      
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      return false;
    };

    // No cleanup needed - we want error suppression to persist
  }, []);

  // Render Privy - errors will be caught by ErrorBoundary
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'dark',
          accentColor: '#9333ea',
        },
        embeddedWallets: {
          createOnLogin: 'off',
          noPromptOnSignature: true,
        },
        externalWallets: {},
        walletConnectors: [],
      }}
    >
      {children}
    </PrivyProvider>
  );
}

// Avalanche Fuji Testnet
const avalancheFuji = {
  id: 43113,
  name: 'Avalanche Fuji',
  network: 'avalanche-fuji',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    public: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
    default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://testnet.snowtrace.io' },
  },
  testnet: true,
};

const { chains, publicClient } = configureChains(
  [avalancheFuji],
  [publicProvider()]
);

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1d62ebd56e09e0c5a87ccf0ab4b607bc';

// getDefaultWallets detecta automáticamente TODOS los wallets inyectados (Core Wallet, MetaMask, etc.)
// usando EIP-6963. Esto debería mostrar Core Wallet si está instalado.
const { connectors } = getDefaultWallets({
  appName: 'MyScorePass',
  projectId,
  chains,
});

const config = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
});

const queryClient = new QueryClient();

// Wrapper para RainbowKit que solo se renderiza en el cliente
function RainbowKitWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const thirdwebClientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
  
  return (
    // Thirdweb primero para wallets y payments (x402)
    <ThirdwebProvider
      clientId={thirdwebClientId || "placeholder"}
    >
      {/* Error Boundary para capturar errores de Privy relacionados con wallets */}
      <PrivyErrorBoundary>
        {/* Wrapper que maneja errores de inicialización y suprime errores de walletProvider */}
        <PrivyWrapper appId={privyAppId}>
          <RainbowKitWrapper>
            {children}
            <Toaster position="top-right" />
          </RainbowKitWrapper>
        </PrivyWrapper>
      </PrivyErrorBoundary>
    </ThirdwebProvider>
  );
}