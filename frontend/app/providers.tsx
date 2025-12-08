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
  
  return (
    // Thirdweb primero para wallets y payments (x402)
    <ThirdwebProvider
      clientId={thirdwebClientId || "placeholder"}
    >
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
          },
          // Deshabilitar external wallets explícitamente para evitar conflictos con Wagmi/RainbowKit
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
    </ThirdwebProvider>
  );
}