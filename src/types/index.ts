
import type { LucideIcon } from 'lucide-react';

export interface Asset {
  id: string;
  name: string;
  price: number;
  currency: string;
  region: string;
  network: string;
  icon?: LucideIcon | string; // Can be LucideIcon or path to SVG/image
  volume: number;
  change24h: number; // Percentage change
  seller: string; // Placeholder for seller info
}

export interface Region {
  id: string;
  name: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
}

export interface BlockchainNetwork {
  id: string;
  name: string;
  icon?: LucideIcon | string;
}

export interface Transaction {
  id: string;
  assetName: string;
  assetIcon?: LucideIcon | string;
  type: 'Buy' | 'Sell';
  amount: number; // Amount of crypto
  price: number; // Price per unit in fiat
  currency: string; // Fiat currency (e.g., USD, EUR, USDT)
  total: number; // total fiat value (amount * price)
  date: string; // ISO string or Date object
  status: 'Completed' | 'Pending' | 'Failed' | 'Cancelled';
  counterparty: string; // Who the trade was with
}

export interface WalletTransaction {
  id: string;
  type: 'Deposit' | 'Withdrawal';
  assetName: string;
  assetSymbol: string; // e.g., BTC, ETH, USD
  assetIcon?: LucideIcon | string;
  amount: number;
  date: string; // ISO string
  status: 'Completed' | 'Pending' | 'Failed' | 'Cancelled';
  network?: string; // Optional, for crypto transactions
  transactionId?: string; // Optional, blockchain transaction ID or reference
}

export interface DepositableAsset {
  id: string; // e.g., 'btc', 'eth', 'usdt'
  name: string; // e.g., 'Bitcoin', 'Ethereum', 'Tether'
  symbol: string; // e.g., 'BTC', 'ETH', 'USDT'
  icon?: LucideIcon | string;
  supportedNetworks: string[]; // Array of network IDs (e.g., ['bitcoin'], ['ethereum', 'bsc'])
}

export interface MockSeller {
  id: string;
  name: string;
  reputation?: number; // e.g., 98 (percentage)
  avgTradeTime?: string; // e.g., "5 mins"
  minSellUSD: number; // Minimum sell amount in USD
  maxSellUSD: number; // Maximum sell amount in USD
  desiredPricePerAssetUSD?: number; // Seller's asking price for one unit of the asset, in USD
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: LucideIcon | string; // Optional icon
}

export interface P2POffer {
  id: string;
  sellerName: string;
  sellerAvatarInitial: string; // e.g., 'S' for STONE_EXCHANGER
  isSellerVerified: boolean; // For the yellow shield icon
  tradeCount: number;
  completionRate: number; // e.g., 99.90 for 99.90%
  positiveFeedbackRate?: number; // e.g., 99.23 for 99.23%
  pricePerCrypto: number; // e.g., 16500
  fiatCurrency: string; // e.g., 'IDR', 'USD'
  cryptoAssetSymbol: string; // e.g., 'USDT'
  minLimitFiat: number; // e.g. 10000
  maxLimitFiat: number; // e.g. 5000000
  availableCrypto: number; // e.g. 648.62
  paymentMethods: string[]; // Array of payment method names or IDs
  avgCompletionTimeMinutes: number; // e.g., 15
  isPromoted?: boolean; // For the "New P2P User Trading Zone" or other highlights
  tags?: string[]; // e.g., ["Verification"]
  advertiserRequirements?: string; // Added for the new modal
}

export interface MarketAsset {
  id: string;
  pair: string; // e.g., "ZK/BTC"
  baseAsset: string; // e.g. "ZK"
  quoteAsset: string; // e.g. "BTC"
  lastPrice: number; // Price in terms of quoteAsset
  lastPriceUSD: number; // USD equivalent of lastPrice
  change24h: number; // Percentage
}
