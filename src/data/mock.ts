
import type { Asset, Region, Currency, BlockchainNetwork, Transaction, WalletTransaction, DepositableAsset, MockSeller } from '@/types';
import { Bitcoin, Landmark, Waves, CircleDollarSign, Replace, DollarSign } from 'lucide-react';

export const mockRegions: Region[] = [
  { id: 'global', name: 'Global' },
  { id: 'north_america', name: 'North America' },
  { id: 'europe', name: 'Europe' },
  { id: 'asia', name: 'Asia' },
  { id: 'south_america', name: 'South America' },
  { id: 'africa', name: 'Africa' },
  { id: 'oceania', name: 'Oceania' },
];

export const mockCurrencies: Currency[] = [
  { id: 'usd', name: 'US Dollar', symbol: '$' },
  { id: 'eur', name: 'Euro', symbol: '€' },
  { id: 'gbp', name: 'British Pound', symbol: '£' },
  { id: 'jpy', name: 'Japanese Yen', symbol: '¥' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT' }, // This is for P2P listing currency filter
];

// Extended for deposit options
export const mockBlockchainNetworks: BlockchainNetwork[] = [
  { id: 'all', name: 'All Networks (for filtering)' }, // Kept for homepage filter consistency
  { id: 'bitcoin', name: 'Bitcoin', icon: Bitcoin },
  { id: 'ethereum', name: 'Ethereum (ERC20)', icon: Landmark },
  { id: 'solana', name: 'Solana', icon: Waves },
  { id: 'bsc', name: 'BNB Smart Chain (BEP20)', icon: Replace },
  { id: 'tron', name: 'TRON (TRC20)', icon: CircleDollarSign }, // Added TRON for USDT
];


export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Bitcoin',
    price: 60000,
    currency: 'USDT',
    region: 'global',
    network: 'bitcoin', // Matches id from mockBlockchainNetworks
    icon: Bitcoin,
    volume: 1.5,
    change24h: 2.5,
    seller: 'CryptoKing',
  },
  {
    id: '2',
    name: 'Ethereum',
    price: 3000,
    currency: 'USDT',
    region: 'europe',
    network: 'ethereum', // Matches id from mockBlockchainNetworks
    icon: Landmark,
    volume: 10,
    change24h: -1.2,
    seller: 'ETHWhale',
  },
  {
    id: '3',
    name: 'Solana',
    price: 150,
    currency: 'USD',
    region: 'asia',
    network: 'solana', // Matches id from mockBlockchainNetworks
    icon: Waves,
    volume: 100,
    change24h: 5.1,
    seller: 'SolTraderPro',
  },
  {
    id: '4',
    name: 'USDC',
    price: 1,
    currency: 'USD',
    region: 'north_america',
    network: 'ethereum', // Matches id from mockBlockchainNetworks
    icon: CircleDollarSign,
    volume: 50000,
    change24h: 0.01,
    seller: 'StableCoinGuru',
  },
  {
    id: '5',
    name: 'BNB',
    price: 580,
    currency: 'USDT',
    region: 'global',
    network: 'bsc', // Matches id from mockBlockchainNetworks
    icon: Replace,
    volume: 50,
    change24h: 1.8,
    seller: 'BNBFan',
  },
  {
    id: '6',
    name: 'Bitcoin (EU Seller)',
    price: 52000,
    currency: 'EUR',
    region: 'europe',
    network: 'bitcoin', // Matches id from mockBlockchainNetworks
    icon: Bitcoin,
    volume: 0.5,
    change24h: 2.1,
    seller: 'EuroBitcoinMax',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    assetName: 'Bitcoin',
    assetIcon: Bitcoin,
    type: 'Buy',
    amount: 0.005,
    price: 60000,
    currency: 'USD',
    total: 300,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'Completed',
    counterparty: 'UserX',
  },
  {
    id: 'tx2',
    assetName: 'Ethereum',
    assetIcon: Landmark,
    type: 'Sell',
    amount: 0.1,
    price: 3000,
    currency: 'USD',
    total: 300,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'Completed',
    counterparty: 'UserY',
  },
  {
    id: 'tx3',
    assetName: 'Solana',
    assetIcon: Waves,
    type: 'Buy',
    amount: 10,
    price: 150,
    currency: 'EUR',
    total: 1500,
    date: new Date(Date.now() - 10 * 60 * 1000).toISOString(), 
    status: 'Pending',
    counterparty: 'UserZ',
  },
  {
    id: 'tx4',
    assetName: 'USDC',
    assetIcon: CircleDollarSign, 
    type: 'Sell',
    amount: 1000,
    price: 0.99,
    currency: 'EUR',
    total: 990,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'Failed',
    counterparty: 'UserA',
  },
  {
    id: 'tx5',
    assetName: 'BNB',
    assetIcon: Replace, 
    type: 'Buy',
    amount: 1,
    price: 580,
    currency: 'USDT',
    total: 580,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'Cancelled',
    counterparty: 'UserB',
  },
];


export const mockWalletTransactions: WalletTransaction[] = [
  {
    id: 'wt1',
    type: 'Deposit',
    assetName: 'US Dollar',
    assetSymbol: 'USD',
    assetIcon: DollarSign,
    amount: 500,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'Completed',
    transactionId: 'DEPO_USD_12345',
  },
  {
    id: 'wt2',
    type: 'Withdrawal',
    assetName: 'Bitcoin',
    assetSymbol: 'BTC',
    assetIcon: Bitcoin,
    amount: 0.01,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'Completed',
    network: 'Bitcoin',
    transactionId: 'WITH_BTC_67890',
  },
  {
    id: 'wt3',
    type: 'Deposit',
    assetName: 'Ethereum',
    assetSymbol: 'ETH',
    assetIcon: Landmark,
    amount: 0.5,
    date: new Date(Date.now() - 5 * 60 * 1000).toISOString(), 
    status: 'Pending',
    network: 'Ethereum (ERC20)',
    transactionId: 'DEPO_ETH_ABCDE',
  },
  {
    id: 'wt4',
    type: 'Withdrawal',
    assetName: 'Euro',
    assetSymbol: 'EUR',
    assetIcon: DollarSign, 
    amount: 200,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'Failed',
    transactionId: 'WITH_EUR_FGHIJ',
  },
    {
    id: 'wt5',
    type: 'Deposit',
    assetName: 'Solana',
    assetSymbol: 'SOL',
    assetIcon: Waves,
    amount: 10,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'Cancelled',
    network: 'Solana',
    transactionId: 'DEPO_SOL_KLMNO',
  },
];

export const depositableAssets: DepositableAsset[] = [
  { 
    id: 'btc', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    icon: Bitcoin, 
    supportedNetworks: ['bitcoin'] 
  },
  { 
    id: 'eth', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    icon: Landmark, 
    supportedNetworks: ['ethereum'] 
  },
  { 
    id: 'usdt', 
    name: 'Tether', 
    symbol: 'USDT', 
    icon: CircleDollarSign, 
    supportedNetworks: ['ethereum', 'bsc', 'tron', 'solana'] 
  },
  { 
    id: 'sol', 
    name: 'Solana', 
    symbol: 'SOL', 
    icon: Waves, 
    supportedNetworks: ['solana'] 
  },
  { 
    id: 'bnb', 
    name: 'BNB', 
    symbol: 'BNB', 
    icon: Replace, 
    supportedNetworks: ['bsc'] 
  },
];

export const generateMockAddress = (assetSymbol: string, networkId: string): string => {
  if (assetSymbol === 'BTC' && networkId === 'bitcoin') return '1Lbcfr7sAHTD9CgdQo3HTk9fgMdtN6fXw4';
  if (assetSymbol === 'ETH' && networkId === 'ethereum') return '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  if (assetSymbol === 'USDT' && networkId === 'ethereum') return '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // ERC20 USDT
  if (assetSymbol === 'USDT' && networkId === 'bsc') return '0x55d398326f99059fF775485246999027B3197955'; // BEP20 USDT
  if (assetSymbol === 'USDT' && networkId === 'tron') return 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // TRC20 USDT
  if (assetSymbol === 'USDT' && networkId === 'solana') return 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'; // SPL USDT
  if (assetSymbol === 'SOL' && networkId === 'solana') return 'SoL1Uo7i1P3r1V9Xm5f5Y9Zz3q6a8b2c7D4eF6gHj9K';
  if (assetSymbol === 'BNB' && networkId === 'bsc') return '0xb8c77482e45F1F44dE1745F52C74426C631bDD52';
  return 'MockAddressNotConfiguredForThisSelection';
};

export const mockSellers: MockSeller[] = [
  { id: 'seller1', name: 'CryptoKing', reputation: 99, avgTradeTime: '3 mins' },
  { id: 'seller2', name: 'ETHWhale', reputation: 97, avgTradeTime: '5 mins' },
  { id: 'seller3', name: 'SolTraderPro', reputation: 95, avgTradeTime: '8 mins' },
  { id: 'seller4', name: 'QuickCoins', reputation: 92, avgTradeTime: '2 mins' },
  { id: 'seller5', name: 'TrustedTradex', reputation: 98, avgTradeTime: '10 mins' },
];
