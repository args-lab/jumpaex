
import type { Asset, Region, Currency, BlockchainNetwork, Transaction, WalletTransaction, DepositableAsset, MockSeller, PaymentMethod, P2POffer } from '@/types';
import { Bitcoin, Landmark, Waves, CircleDollarSign, Replace, DollarSign, ShieldCheck, Clock, Banknote, CreditCard } from 'lucide-react';

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
  { id: 'idr', name: 'Indonesian Rupiah', symbol: 'Rp' },
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
    currency: 'USDT', // Price is in USDT, assume 1 USDT = 1 USD for simplicity in getAssetPriceInUSD
    region: 'global',
    network: 'bitcoin',
    icon: Bitcoin,
    volume: 1.5,
    change24h: 2.5,
    seller: 'CryptoKing',
  },
  {
    id: '2',
    name: 'Ethereum',
    price: 3000,
    currency: 'USDT', // Price is in USDT
    region: 'europe',
    network: 'ethereum',
    icon: Landmark,
    volume: 10,
    change24h: -1.2,
    seller: 'ETHWhale',
  },
  {
    id: '3',
    name: 'Solana',
    price: 150,
    currency: 'USD', // Price is in USD
    region: 'asia',
    network: 'solana',
    icon: Waves,
    volume: 100,
    change24h: 5.1,
    seller: 'SolTraderPro',
  },
  {
    id: '4',
    name: 'USDC',
    price: 1,
    currency: 'USD', // Price is in USD
    region: 'north_america',
    network: 'ethereum',
    icon: CircleDollarSign,
    volume: 50000,
    change24h: 0.01,
    seller: 'StableCoinGuru',
  },
  {
    id: '5',
    name: 'BNB',
    price: 580,
    currency: 'USDT', // Price is in USDT
    region: 'global',
    network: 'bsc',
    icon: Replace,
    volume: 50,
    change24h: 1.8,
    seller: 'BNBFan',
  },
  {
    id: '6',
    name: 'Bitcoin (EU Seller)',
    price: 52000,
    currency: 'EUR', // Price is in EUR
    region: 'europe',
    network: 'bitcoin',
    icon: Bitcoin,
    volume: 0.5,
    change24h: 2.1,
    seller: 'EuroBitcoinMax',
  },
  { // Added MOVE to mockAssets for easier price lookup
    id: '7',
    name: 'Move',
    price: 0.15, // Example price in USDT
    currency: 'USDT',
    region: 'global',
    network: 'solana', // Assuming Solana, adjust if different
    icon: 'https://placehold.co/32x32.png', // Placeholder, same as in assets page
    volume: 10000,
    change24h: 3.0,
    seller: 'MoveMover',
  }
];

export const MOCK_CONVERSION_RATES: Record<string, number> = {
  USD: 1,
  USDT: 1, // Assuming 1 USDT = 1 USD for simplicity
  EUR: 1.08, // Example: 1 EUR = 1.08 USD
  GBP: 1.25, // Example: 1 GBP = 1.25 USD
  IDR: 1 / 16000, // Example: 1 IDR = 1/16000 USD
  MOVE: 0.15, // MOVE to USD rate (1 MOVE = 0.15 USD)
  // Add other fiat currencies if needed
};

export const getAssetPriceInUSD = (assetSymbolOrId: string, assets: Asset[] = mockAssets): number => {
  const upperSymbol = assetSymbolOrId.toUpperCase();

  // First, check direct conversion rates (like fiat or MOVE)
  if (MOCK_CONVERSION_RATES[upperSymbol]) {
    return MOCK_CONVERSION_RATES[upperSymbol];
  }
  
  // Then, look up in mockAssets
  const assetInfo = assets.find(a => a.id.toUpperCase() === upperSymbol || a.name.toUpperCase().startsWith(upperSymbol) || a.name.toUpperCase() === upperSymbol || a.symbol?.toUpperCase() === upperSymbol);

  if (!assetInfo) {
    console.warn(`Asset or symbol ${assetSymbolOrId} not found for USD price conversion.`);
    return 0;
  }

  const currencyUpper = assetInfo.currency.toUpperCase();
  if (currencyUpper === 'USD') {
    return assetInfo.price;
  }
  if (MOCK_CONVERSION_RATES[currencyUpper]) { // If asset currency is EUR, GBP etc.
    return assetInfo.price * MOCK_CONVERSION_RATES[currencyUpper];
  }
   // This handles cases like BTC price in USDT, ETH price in USDT
  if (currencyUpper === 'USDT' && MOCK_CONVERSION_RATES['USDT'] === 1) { 
      return assetInfo.price;
  }


  console.warn(`Conversion rate for ${assetInfo.currency} to USD not found for asset ${assetInfo.name}. Assuming 1:1 or check MOCK_CONVERSION_RATES.`);
  return assetInfo.price; // Fallback, might not be USD
};


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
  { // Added for convert page example
    id: 'move',
    name: 'Move',
    symbol: 'MOVE',
    icon: 'https://placehold.co/32x32.png', // Placeholder Icon
    supportedNetworks: ['solana'] // Example, adjust if needed
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
  { id: 'seller1', name: 'CryptoKing', reputation: 99, avgTradeTime: '3 mins', minSellUSD: 50, maxSellUSD: 10000, desiredPricePerAssetUSD: 60500 }, // For Bitcoin
  { id: 'seller2', name: 'ETHWhale', reputation: 97, avgTradeTime: '5 mins', minSellUSD: 100, maxSellUSD: 50000, desiredPricePerAssetUSD: 3020 },    // For Ethereum
  { id: 'seller3', name: 'SolTraderPro', reputation: 95, avgTradeTime: '8 mins', minSellUSD: 20, maxSellUSD: 2000, desiredPricePerAssetUSD: 152 },      // For Solana
  { id: 'seller4', name: 'QuickCoins', reputation: 92, avgTradeTime: '2 mins', minSellUSD: 10, maxSellUSD: 500, desiredPricePerAssetUSD: 1.01 },       // For USDC
  { id: 'seller5', name: 'TrustedTradex', reputation: 98, avgTradeTime: '10 mins', minSellUSD: 200, maxSellUSD: 25000, desiredPricePerAssetUSD: 585 },   // For BNB
  { id: 'seller6', name: 'EuroBitcoinMax', reputation: 96, avgTradeTime: '7 mins', minSellUSD: 100, maxSellUSD: 15000, desiredPricePerAssetUSD: 52500 * 1.08 }, // For Bitcoin (EU Seller), price in EUR converted to USD
];

export const mockPaymentMethods: PaymentMethod[] = [
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Banknote },
  { id: 'mandiri_pay', name: 'Mandiri Pay', icon: CreditCard }, // Generic icon
  { id: 'dana_indonesia', name: 'DANA (Indonesia)', icon: CreditCard }, // Generic icon
  { id: 'bca', name: 'BCA', icon: Banknote },
  { id: 'blu', name: 'Blu', icon: CreditCard },
  { id: 'allo_bank', name: 'Allo Bank', icon: Banknote },
  { id: 'generic_wallet', name: 'E-Wallet', icon: CreditCard},
  { id: 'wise', name: 'Wise', icon: CreditCard },
  { id: 'revolut', name: 'Revolut', icon: CreditCard },
  { id: 'paypal', name: 'PayPal', icon: CreditCard },
];

const defaultAdvertiserRequirements = `Jika iklan tersedia berarti Online dan ready.
Order akan di release saat dana sudah diterima di rekening.
Mohon untuk klik tombol "sudah dibayar", jika sudah melakukan pembayaran.
Terima kasih.
========================
If you see this ads, that means i am online and ready to serve.
Order will be released ASAP when the fund arrived on my account.
Please click "Transferred" button once you've done transferring the fund to me.
Thank you and happy trading :)`;

export const mockP2POffers: P2POffer[] = [
  {
    id: 'p2p_offer_1',
    sellerName: 'STONE_EXCHANGER',
    sellerAvatarInitial: 'S',
    isSellerVerified: true,
    tradeCount: 890,
    completionRate: 99.90,
    positiveFeedbackRate: 99.23,
    pricePerCrypto: 16500,
    fiatCurrency: 'IDR',
    cryptoAssetSymbol: 'USDT',
    minLimitFiat: 10000,
    maxLimitFiat: 5000000,
    availableCrypto: 648.62,
    paymentMethods: ['Bank Transfer', 'Mandiri Pay'],
    avgCompletionTimeMinutes: 15,
    tags: ['Verification'],
    isPromoted: true,
    advertiserRequirements: defaultAdvertiserRequirements,
  },
  {
    id: 'p2p_offer_2',
    sellerName: 'PENSILWARNA',
    sellerAvatarInitial: 'P',
    isSellerVerified: true,
    tradeCount: 4600,
    completionRate: 99.90,
    positiveFeedbackRate: 99.82,
    pricePerCrypto: 13034,
    fiatCurrency: 'IDR',
    cryptoAssetSymbol: 'USDT',
    minLimitFiat: 10000,
    maxLimitFiat: 30000,
    availableCrypto: 268.81,
    paymentMethods: ['DANA (Indonesia)'],
    avgCompletionTimeMinutes: 15,
    advertiserRequirements: defaultAdvertiserRequirements,
  },
  {
    id: 'p2p_offer_3',
    sellerName: 'THE_GUS',
    sellerAvatarInitial: 'T',
    isSellerVerified: true,
    tradeCount: 1091,
    completionRate: 100.00,
    positiveFeedbackRate: 99.41,
    pricePerCrypto: 13960,
    fiatCurrency: 'IDR',
    cryptoAssetSymbol: 'USDT',
    minLimitFiat: 10000,
    maxLimitFiat: 45000,
    availableCrypto: 271.41,
    paymentMethods: ['BCA', 'Blu', 'Allo Bank', 'Bank Transfer', 'DANA (Indonesia)'],
    avgCompletionTimeMinutes: 15,
    tags: ['Verification'],
    advertiserRequirements: "Fast trades only. Please be ready to complete within 5 minutes.",
  },
  {
    id: 'p2p_offer_4',
    sellerName: 'GlobalTrader',
    sellerAvatarInitial: 'G',
    isSellerVerified: false,
    tradeCount: 250,
    completionRate: 95.50,
    positiveFeedbackRate: 92.00,
    pricePerCrypto: 0.998,
    fiatCurrency: 'USD',
    cryptoAssetSymbol: 'USDT',
    minLimitFiat: 50,
    maxLimitFiat: 2000,
    availableCrypto: 1500.75,
    paymentMethods: ['Wise', 'Revolut'],
    avgCompletionTimeMinutes: 10,
    advertiserRequirements: "Welcome! Please provide your Wise/Revolut details clearly. GMT business hours preferred.",
  },
  {
    id: 'p2p_offer_5',
    sellerName: 'EuroSeller',
    sellerAvatarInitial: 'E',
    isSellerVerified: true,
    tradeCount: 1200,
    completionRate: 99.00,
    positiveFeedbackRate: 98.50,
    pricePerCrypto: 0.93,
    fiatCurrency: 'EUR',
    cryptoAssetSymbol: 'USDT',
    minLimitFiat: 100,
    maxLimitFiat: 5000,
    availableCrypto: 3000.00,
    paymentMethods: ['Bank Transfer', 'PayPal'],
    avgCompletionTimeMinutes: 5,
    tags: ['Verification'],
    advertiserRequirements: "SEPA transfers and PayPal F&F only. Expect quick release.",
  },
];
