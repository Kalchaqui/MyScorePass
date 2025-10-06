'use client';

import * as React from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Paseo testnet
const paseoTestnet = {
  id: 420420422,
  name: 'Paseo Asset Hub',
  network: 'paseo',
  nativeCurrency: {
    decimals: 18,
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    public: { http: ['https://testnet-passet-hub-eth-rpc.polkadot.io'] },
    default: { http: ['https://testnet-passet-hub-eth-rpc.polkadot.io'] },
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'https://blockscout-passet-hub.parity-testnet.parity.io' },
  },
  testnet: true,
};

const { chains, publicClient } = configureChains(
  [paseoTestnet],
  [publicProvider()]
);

const projectId = 'demo-project-id';

const { wallets } = getDefaultWallets({
  appName: 'DeFiCred',
  projectId,
  chains,
});

const connectors = connectorsForWallets([...wallets]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          {children}
          <Toaster position="top-right" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}