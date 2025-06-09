
'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import type { ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query'; // Wagmi uses React Query

// 1. Get projectId from WalletConnect Cloud
const projectId = '37ff5b98cdf7fe486bbf826ff5f148a5'; // Should be NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// 2. Create wagmiConfig
const metadata = {
  name: 'AnonTrade',
  description: 'P2P Crypto Trading Telegram Mini App',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://anontrade.example.com', // origin for local, your deployed url for production
  icons: ['https://placehold.co/128x128.png'] // Replace with your app icon
};

const wagmiChains = [mainnet, sepolia] as const; // Ensure it's const for type inference

const wagmiConfig = createConfig({
  chains: wagmiChains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true, // Important for Next.js
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId,
  enableAnalytics: false, // Optional - defaults to your Cloud configuration
  // themeMode: 'light', // Optional: 'light', 'dark', or 'auto'
});

// QueryClient instance for WagmiProvider
const queryClient = new QueryClient();

export function Web3ModalProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig} client={queryClient}>
      {children}
    </WagmiProvider>
  );
}
