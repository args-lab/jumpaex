import type { Asset, Region, Currency, BlockchainNetwork, Transaction, WalletTransaction } from '@/types';
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
  { id: 'usdt', name: 'Tether', symbol: 'USDT' },
];

export const mockBlockchainNetworks: BlockchainNetwork[] = [
  { id: 'all', name: 'All Networks' },
  { id: 'bitcoin', name: 'Bitcoin', icon: Bitcoin },
  { id: 'ethereum', name: 'Ethereum', icon: Landmark },
  { id: 'solana', name: 'Solana', icon: Waves },
  { id: 'bsc', name: 'BNB Smart Chain', icon: Replace },
];

export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Bitcoin',
    price: 60000,
    currency: 'USDT',
    region: 'global',
    network: 'Bitcoin',
    icon: Bitcoin,
    volume: 1.5,
    change24h: 2.5,
    seller: 'UserA',
  },
  {
    id: '2',
    name: 'Ethereum',
    price: 3000,
    currency: 'USDT',
    region: 'europe',
    network: 'Ethereum',
    icon: Landmark,
    volume: 10,
    change24h: -1.2,
    seller: 'UserB',
  },
  {
    id: '3',
    name: 'Solana',
    price: 150,
    currency: 'USD',
    region: 'asia',
    network: 'Solana',
    icon: Waves,
    volume: 100,
    change24h: 5.1,
    seller: 'UserC',
  },
  {
    id: '4',
    name: 'USDC',
    price: 1,
    currency: 'USD',
    region: 'north_america',
    network: 'Ethereum',
    icon: CircleDollarSign,
    volume: 50000,
    change24h: 0.01,
    seller: 'UserD',
  },
  {
    id: '5',
    name: 'BNB',
    price: 580,
    currency: 'USDT',
    region: 'global',
    network: 'BSC',
    icon: Replace,
    volume: 50,
    change24h: 1.8,
    seller: 'UserE',
  },
  {
    id: '6',
    name: 'Bitcoin (EU Seller)',
    price: 52000,
    currency: 'EUR',
    region: 'europe',
    network: 'Bitcoin',
    icon: Bitcoin,
    volume: 0.5,
    change24h: 2.1,
    seller: 'UserF',
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
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
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
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
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
    date: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    status: 'Pending',
    counterparty: 'UserZ',
  },
  {
    id: 'tx4',
    assetName: 'USDC',
    assetIcon: CircleDollarSign, // Using generic USDC icon
    type: 'Sell',
    amount: 1000,
    price: 0.99,
    currency: 'EUR',
    total: 990,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'Failed',
    counterparty: 'UserA',
  },
  {
    id: 'tx5',
    assetName: 'BNB',
    assetIcon: Replace, // Using generic BNB icon
    type: 'Buy',
    amount: 1,
    price: 580,
    currency: 'USDT',
    total: 580,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
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
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
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
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
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
    date: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    status: 'Pending',
    network: 'Ethereum',
    transactionId: 'DEPO_ETH_ABCDE',
  },
  {
    id: 'wt4',
    type: 'Withdrawal',
    assetName: 'Euro',
    assetSymbol: 'EUR',
    assetIcon: DollarSign, // Using DollarSign for generic fiat
    amount: 200,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
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
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    status: 'Cancelled',
    network: 'Solana',
    transactionId: 'DEPO_SOL_KLMNO',
  },
];
