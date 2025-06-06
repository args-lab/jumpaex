import type { Asset, Region, Currency, BlockchainNetwork } from '@/types';
import { Bitcoin, Landmark, Waves, CircleDollarSign, Replace } from 'lucide-react';

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
