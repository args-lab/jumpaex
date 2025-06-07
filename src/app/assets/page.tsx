
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
import { DollarSign, HelpCircle } from 'lucide-react';

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
  const walletAsset = mockWalletTransactions.find(tx => tx.assetSymbol.toUpperCase() === upperSymbol);
  if (walletAsset && !['USD', 'EUR', 'GBP', 'JPY'].includes(upperSymbol)) {
     const foundByName = mockAssets.find(a => a.name === walletAsset.assetName);
     if (foundByName) {
       return foundByName.currency.toUpperCase() === 'USDT' ? foundByName.price * MOCK_CONVERSION_RATES['USDT'] : foundByName.price;
     }
     console.warn(`Price for ${assetSymbol} not found in mockAssets, defaulting to 0 for USD value calculation.`);
     return 0;
  }
  return 0; 
};

const getWalletAmountMinMaxDigits = (amount: number, assetSymbol: string) => {
  const fiatSymbols = ['USD', 'EUR', 'GBP', 'JPY']; 
  if (fiatSymbols.includes(assetSymbol.toUpperCase())) {
    return 2;
  }
  return amount !== 0 && Math.abs(amount) < 0.000001 ? 8 : (Math.abs(amount) < 1 ? 6 : 4);
};

// Helper function to format crypto numeric part client-side
const formatCryptoNumericString = (amount: number, assetSymbol: string, locale: string | undefined) => {
  const minMaxDigits = getWalletAmountMinMaxDigits(amount, assetSymbol);
  return amount.toLocaleString(locale, {
    minimumFractionDigits: minMaxDigits,
    maximumFractionDigits: minMaxDigits,
  });
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
  formattedBalance: string; // Just the number e.g. "0.1000"
  formattedValueUSD: string; // Full currency string e.g. "$300.00"
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
      if (tx.status === 'Completed') {
        if (tx.type === 'Deposit') {
          calculatedAssetBalances[symbolUpper].totalAmount += tx.amount;
        } else if (tx.type === 'Withdrawal') {
          calculatedAssetBalances[symbolUpper].totalAmount -= tx.amount;
        }
      }
    });

    const locale = typeof window !== 'undefined' ? navigator.language : undefined;

    const processAndFormat = (data: typeof calculatedAssetBalances) => {
        return Object.entries(data)
            .map(([symbol, assetData]) => {
                if (assetData.totalAmount === 0 && !assetData.isFiat) return null;
                const priceInUSD = assetData.isFiat ? MOCK_CONVERSION_RATES[symbol] || 0 : getAssetPriceInUSD(symbol);
                const valueUSD = assetData.totalAmount * priceInUSD;
                return {
                    symbol: symbol,
                    name: assetData.name,
                    icon: assetData.icon,
                    balance: assetData.totalAmount,
                    valueUSD: valueUSD,
                    isFiat: assetData.isFiat,
                    formattedBalance: formatCryptoNumericString(assetData.totalAmount, symbol, locale),
                    formattedValueUSD: formatCurrencyValue(valueUSD, locale),
                };
            })
            .filter(Boolean) as DisplayableUserAsset[];
    };
    
    const initialFormatted = processAndFormat(calculatedAssetBalances).map(asset => ({
        ...asset,
        formattedBalance: asset.balance.toFixed(getWalletAmountMinMaxDigits(asset.balance, asset.symbol)),
        formattedValueUSD: `$${asset.valueUSD.toFixed(2)}` // Simple USD for SSR
    }));

    if (displayableBalances.length === 0 && isLoadingBalances) {
       setDisplayableBalances(initialFormatted);
    }
    
    setTimeout(() => {
        const clientFormatted = processAndFormat(calculatedAssetBalances);
        setDisplayableBalances(clientFormatted);
        setIsLoadingBalances(false);
    },0);

  }, []);

  const getAssetIconDisplay = (icon: DisplayableUserAsset['icon'], name: string, symbol: string) => {
    const AssetIconComponent = icon && typeof icon !== 'string' ? icon : null;
    if (AssetIconComponent) {
      return <AssetIconComponent className="h-8 w-8 shrink-0" />;
    }
    if (typeof icon === 'string') {
      return <Image src={icon} alt={name} width={32} height={32} className="rounded-full shrink-0" data-ai-hint={`${name} logo`} />;
    }
    if (['USD', 'EUR', 'GBP', 'JPY'].includes(symbol.toUpperCase())) {
        return <DollarSign className="h-8 w-8 shrink-0 text-muted-foreground" />;
    }
    return <HelpCircle className="h-8 w-8 shrink-0 text-muted-foreground" />;
  };
  
  const assetsToDisplay = isLoadingBalances && displayableBalances.length === 0 
    ? mockWalletTransactions.reduce((acc, tx) => { 
        if (!acc.find(a => a.symbol === tx.assetSymbol.toUpperCase())) {
          const isFiat = ['USD', 'EUR', 'GBP', 'JPY'].includes(tx.assetSymbol.toUpperCase());
          acc.push({
            symbol: tx.assetSymbol.toUpperCase(),
            name: tx.assetName,
            icon: tx.assetIcon,
            balance: 0, 
            valueUSD: 0, 
            isFiat: isFiat,
            formattedBalance: `0.00`,
            formattedValueUSD: `$0.00`,
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
                <TableHead>Asset</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetsToDisplay.map((asset) => (
                <TableRow key={asset.symbol}>
                  <TableCell>
                    <div className="flex items-center py-2">
                      {getAssetIconDisplay(asset.icon, asset.name, asset.symbol)}
                      <div className="ml-4 flex-grow">
                        <div className="flex justify-between items-baseline">
                          <span className="font-medium text-base">{asset.symbol}.</span>
                          <span className="font-mono text-base text-right">{asset.formattedBalance}</span>
                        </div>
                        <div className="flex justify-between items-baseline mt-0.5">
                          <span className="text-sm text-muted-foreground">{asset.name}</span>
                          <span className="font-mono text-sm text-muted-foreground text-right">{asset.formattedValueUSD}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
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
