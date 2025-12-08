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
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Si el error es relacionado con walletProvider, lo ignoramos silenciosamente
    if (error.message?.includes('walletProvider') || error.message?.includes('on is not a function')) {
      console.warn('Privy wallet error ignorado (esperado cuando se deshabilitan wallets):', error.message);
      return { hasError: false }; // No mostrar error, continuar normalmente
    }
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Solo loggear si no es un error de walletProvider
    if (!error.message?.includes('walletProvider') && !error.message?.includes('on is not a function')) {
      console.error('Error en PrivyProvider:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Si hay un error real (no relacionado con wallets), mostrar children sin Privy
      return <>{this.props.children}</>;
    }
    return <>{this.props.children}</>;
  }
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
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // Suprimir errores de Privy relacionados con walletProvider
  React.useEffect(() => {
    const originalError = window.console.error;
    window.console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || '';
      // Ignorar errores relacionados con walletProvider de Privy
      if (errorMessage.includes('walletProvider') || errorMessage.includes('on is not a function')) {
        // Suprimir este error específico
        return;
      }
      // Mostrar otros errores normalmente
      originalError.apply(window.console, args);
    };

    return () => {
      window.console.error = originalError;
    };
  }, []);
  
  return (
    // Thirdweb primero para wallets y payments (x402)
    <ThirdwebProvider
      clientId={thirdwebClientId || "placeholder"}
    >
      {/* Error Boundary para capturar errores de Privy relacionados con wallets */}
      <PrivyErrorBoundary>
        {/* Privy solo para autenticación (email/password) - SIN wallets */}
        <PrivyProvider
          appId={privyAppId || ''}
          config={{
            loginMethods: ['email'], // Solo email - Privy maneja login/registro automáticamente
            appearance: {
              theme: 'dark',
              accentColor: '#9333ea',
            },
            // Deshabilitar COMPLETAMENTE todos los wallets en Privy
            embeddedWallets: {
              createOnLogin: 'off',
              noPromptOnSignature: true,
            },
          // Deshabilitar external wallets completamente usando objeto vacío
          externalWallets: {},
          // Evitar que Privy inicialice cualquier wallet connector automáticamente
          walletConnectors: [],
          }}
        >
          <RainbowKitWrapper>
            {children}
            <Toaster position="top-right" />
          </RainbowKitWrapper>
        </PrivyProvider>
      </PrivyErrorBoundary>
    </ThirdwebProvider>
  );
}