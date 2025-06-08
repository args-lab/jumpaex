
'use client';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider, type State } from 'wagmi';
import { arbitrum, mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Your WalletConnect Cloud project ID
const projectId = '37ff5b98cdf7fe486bbf826ff5f148a5'; // Replace with your actual project ID

// 2. Create wagmiConfig
const metadata = {
  name: 'AnonTrade',
  description: 'AnonTrade - P2P Crypto Trading Telegram Mini App',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://anontrade.example.com', // Make sure to replace with your Vercel domain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet, arbitrum, sepolia] as const; // Add more chains if needed
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  //...wagmiOptions // Optional - Override createConfig parameters
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  themeMode: 'light', // Optional: 'light' | 'dark' | 'system'
  // You can add more theme variables here to customize colors, fonts, etc.
  // Refer to Web3Modal documentation for available theme variables.
});

interface Web3ModalProviderProps {
  children: ReactNode;
  initialState?: State; // For SSR
}

export function Web3ModalProvider({ children, initialState }: Web3ModalProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
