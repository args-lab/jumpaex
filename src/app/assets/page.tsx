
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { mockWalletTransactions, mockAssets } from '@/data/mock';
import type { WalletTransaction } from '@/types';
import { DollarSign, HelpCircle } from 'lucide-react'; // Added HelpCircle for generic crypto

// Mock conversion rates (can be fetched from an API in a real app)
const MOCK_CONVERSION_RATES: Record<string, number> = {
  USD: 1,
  USDT: 1, // Assuming 1 USDT = 1 USD for simplicity
  EUR: 1.08, // Example: 1 EUR = 1.08 USD
  GBP: 1.25, // Example: 1 GBP = 1.25 USD
};

const getAssetPriceInUSD = (assetSymbol: string): number => {
  const upperSymbol = assetSymbol.toUpperCase();
  if (MOCK_CONVERSION_RATES[upperSymbol]) {
    return MOCK_CONVERSION_RATES[upperSymbol];
  }
  const assetInfo = mockAssets.find(a => a.name.toUpperCase().startsWith(upperSymbol) || a.name.toUpperCase() === upperSymbol);
  if (assetInfo) {
    return assetInfo.currency.toUpperCase() === 'USDT' ? assetInfo.price * MOCK_CONVERSION_RATES['USDT'] : assetInfo.price;
  }
  // Fallback for crypto assets not in mockAssets price list but in wallet transactions, assume price is 1 for calculation simplicity if not found
  // This scenario should be rare if mockAssets is comprehensive for owned crypto.
  const walletAsset = mockWalletTransactions.find(tx => tx.assetSymbol.toUpperCase() === upperSymbol);
  if (walletAsset && !['USD', 'EUR', 'GBP', 'JPY'].includes(upperSymbol)) { // If it's a crypto
     // Attempt to find its price in mockAssets by name if symbol match failed
     const foundByName = mockAssets.find(a => a.name === walletAsset.assetName);
     if (foundByName) {
       return foundByName.currency.toUpperCase() === 'USDT' ? foundByName.price * MOCK_CONVERSION_RATES['USDT'] : foundByName.price;
     }
     console.warn(`Price for ${assetSymbol} not found in mockAssets, defaulting to 0 for USD value calculation.`);
     return 0; // Default to 0 if price truly unknown to avoid overestimation
  }
  return 0; 
};


// Helper to determine decimal places for wallet transactions
const getWalletAmountMinMaxDigits = (amount: number, assetSymbol: string) => {
  const fiatSymbols = ['USD', 'EUR', 'GBP', 'JPY']; 
  if (fiatSymbols.includes(assetSymbol.toUpperCase())) {
    return 2;
  }
  // For crypto, show more precision for small amounts
  return amount !== 0 && Math.abs(amount) < 0.000001 ? 8 : (Math.abs(amount) < 1 ? 6 : 4);
};

// Helper function to format amount client-side
const formatWalletAmount = (amount: number, assetSymbol: string, locale: string | undefined) => {
  const minMaxDigits = getWalletAmountMinMaxDigits(amount, assetSymbol);
  const formattedAmount = amount.toLocaleString(locale, {
    minimumFractionDigits: minMaxDigits,
    maximumFractionDigits: minMaxDigits,
  });
  return `${formattedAmount} ${assetSymbol.toUpperCase()}`;
};

// Helper to format currency values (USD)
const formatCurrencyValue = (value: number, locale: string | undefined) => {
  return value.toLocaleString(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface DisplayableUserAsset {
  symbol: string;
  name: string;
  icon?: LucideIcon | string;
  balance: number;
  valueUSD: number;
  isFiat: boolean;
  // For client-side formatting
  displayBalance: string;
  displayValueUSD: string;
}

export default function AssetsPage() {
  const [displayableBalances, setDisplayableBalances] = useState<DisplayableUserAsset[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);

  useEffect(() => {
    setIsLoadingBalances(true);
    const calculatedAssetBalances: Record<string, { 
      totalAmount: number; 
      name: string; 
      icon?: LucideIcon | string; 
      isFiat: boolean;
    }> = {};

    mockWalletTransactions.forEach(tx => {
      const symbolUpper = tx.assetSymbol.toUpperCase();
      if (!calculatedAssetBalances[symbolUpper]) {
        calculatedAssetBalances[symbolUpper] = { 
          totalAmount: 0, 
          name: tx.assetName, 
          icon: tx.assetIcon,
          isFiat: ['USD', 'EUR', 'GBP', 'JPY'].includes(symbolUpper),
        };
      }
      if (tx.status === 'Completed') { // Only count completed transactions for balance
        if (tx.type === 'Deposit') {
          calculatedAssetBalances[symbolUpper].totalAmount += tx.amount;
        } else if (tx.type === 'Withdrawal') {
          calculatedAssetBalances[symbolUpper].totalAmount -= tx.amount;
        }
      }
    });

    const locale = typeof window !== 'undefined' ? navigator.language : undefined;

    const formatted = Object.entries(calculatedAssetBalances)
      .map(([symbol, data]) => {
        if (data.totalAmount === 0 && !data.isFiat) return null; // Don't show zero-balance crypto assets unless it's a fiat account (which might be 0)

        const priceInUSD = data.isFiat ? MOCK_CONVERSION_RATES[symbol] || 0 : getAssetPriceInUSD(symbol);
        const valueUSD = data.totalAmount * priceInUSD;
        
        // SSR-friendly formats
        const ssrDisplayBalance = `${data.totalAmount.toFixed(getWalletAmountMinMaxDigits(data.totalAmount, symbol))} ${symbol.toUpperCase()}`;
        const ssrDisplayValueUSD = `$${valueUSD.toFixed(2)}`;

        return {
          symbol: symbol,
          name: data.name,
          icon: data.icon,
          balance: data.totalAmount,
          valueUSD: valueUSD,
          isFiat: data.isFiat,
          displayBalance: formatWalletAmount(data.totalAmount, symbol, locale), // Will be updated client-side by this effect
          displayValueUSD: data.isFiat ? formatWalletAmount(data.totalAmount * (MOCK_CONVERSION_RATES[symbol] || 0) , 'USD', locale) : formatCurrencyValue(valueUSD, locale), // Same here
        };
      })
      .filter(Boolean) as DisplayableUserAsset[];
      
    // For initial client render before this effect properly sets locale formats
    const initialFormatted = formatted.map(asset => ({
        ...asset,
        displayBalance: `${asset.balance.toFixed(getWalletAmountMinMaxDigits(asset.balance, asset.symbol))} ${asset.symbol.toUpperCase()}`,
        displayValueUSD: `$${asset.valueUSD.toFixed(2)}`
    }));


    // Set initial state for SSR/hydration match
    if (displayableBalances.length === 0 && isLoadingBalances) {
       setDisplayableBalances(initialFormatted);
    }
    
    // Then update with client-specific locale formatting
    // This timeout ensures the state update happens after the initial render pass
    setTimeout(() => {
        const clientFormatted = Object.entries(calculatedAssetBalances)
            .map(([symbol, data]) => {
                 if (data.totalAmount === 0 && !data.isFiat) return null;
                 const priceInUSD = data.isFiat ? MOCK_CONVERSION_RATES[symbol] || 0 : getAssetPriceInUSD(symbol);
                 const valueUSD = data.totalAmount * priceInUSD;
                 return {
                    symbol: symbol,
                    name: data.name,
                    icon: data.icon,
                    balance: data.totalAmount,
                    valueUSD: valueUSD,
                    isFiat: data.isFiat,
                    displayBalance: formatWalletAmount(data.totalAmount, symbol, locale),
                    displayValueUSD: data.isFiat ? formatWalletAmount(data.totalAmount * (MOCK_CONVERSION_RATES[symbol] || 0), 'USD', locale) : formatCurrencyValue(valueUSD, locale),
                 };
            })
            .filter(Boolean) as DisplayableUserAsset[];
        setDisplayableBalances(clientFormatted);
        setIsLoadingBalances(false);
    },0);


  }, []); // Run once on mount

  const getAssetIconDisplay = (icon: DisplayableUserAsset['icon'], name: string, symbol: string) => {
    const AssetIconComponent = icon && typeof icon !== 'string' ? icon : null;
    if (AssetIconComponent) {
      return <AssetIconComponent className="h-8 w-8 mr-3 shrink-0" />;
    }
    if (typeof icon === 'string') {
      return <Image src={icon} alt={name} width={32} height={32} className="rounded-full mr-3 shrink-0" data-ai-hint={`${name} logo`} />;
    }
    if (['USD', 'EUR', 'GBP', 'JPY'].includes(symbol.toUpperCase())) {
        return <DollarSign className="h-8 w-8 mr-3 shrink-0 text-muted-foreground" />;
    }
    // Fallback for crypto assets if no icon is provided
    return <HelpCircle className="h-8 w-8 mr-3 shrink-0 text-muted-foreground" />;
  };
  
  const assetsToDisplay = isLoadingBalances && displayableBalances.length === 0 
    ? mockWalletTransactions.reduce((acc, tx) => { // Basic SSR fallback if useEffect hasn't run
        if (!acc.find(a => a.symbol === tx.assetSymbol.toUpperCase())) {
          const isFiat = ['USD', 'EUR', 'GBP', 'JPY'].includes(tx.assetSymbol.toUpperCase());
          const price = isFiat ? (MOCK_CONVERSION_RATES[tx.assetSymbol.toUpperCase()] || 0) : getAssetPriceInUSD(tx.assetSymbol);
          acc.push({
            symbol: tx.assetSymbol.toUpperCase(),
            name: tx.assetName,
            icon: tx.assetIcon,
            balance: 0, // Actual balance calculation deferred
            valueUSD: 0, // Actual value calculation deferred
            isFiat: isFiat,
            displayBalance: `0.00 ${tx.assetSymbol.toUpperCase()}`,
            displayValueUSD: `$0.00`,
          });
        }
        return acc;
      }, [] as DisplayableUserAsset[])
    : displayableBalances;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 pt-8 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold mb-2">My Assets</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Overview of your current asset balances.</p>
        </div>

        <div className="rounded-lg border shadow-sm bg-card overflow-x-auto">
          <Table>
            {(isLoadingBalances || assetsToDisplay.length === 0) && (
              <TableCaption>
                {isLoadingBalances ? 'Loading your asset balances...' : 'No assets to display. Deposit funds to get started.'}
              </TableCaption>
            )}
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] whitespace-nowrap">Asset</TableHead>
                <TableHead className="text-right whitespace-nowrap">Balance</TableHead>
                <TableHead className="text-right whitespace-nowrap">Approx. Value (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetsToDisplay.map((asset) => (
                <TableRow key={asset.symbol}>
                  <TableCell>
                    <div className="flex items-center">
                      {getAssetIconDisplay(asset.icon, asset.name, asset.symbol)}
                      <div>
                        <span className="font-medium">{asset.name}</span>
                        <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{asset.displayBalance}</TableCell>
                  <TableCell className="text-right font-mono">{asset.displayValueUSD}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      <BottomNavigationBar />
    </div>
  );
}
