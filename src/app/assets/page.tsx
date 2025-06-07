
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockWalletTransactions, mockAssets, mockCurrencies, depositableAssets, MOCK_CONVERSION_RATES as mockConversionRates } from '@/data/mock';
import type { WalletTransaction, Asset as MockAssetType } from '@/types';
import { Eye, ChevronDown, Coins, Search, SlidersHorizontal, DollarSign, HelpCircle, Bitcoin, Landmark, Waves, Replace, CircleDollarSign as UsdtIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extended interface for displayable assets
interface DisplayableUserAsset {
  symbol: string;
  name: string;
  icon?: LucideIcon | string;
  balance: number;
  valueUSD: number;
  averageCostUSD?: number;
  pnlTotalUSD?: number;
  pnlPercentage?: number;
  isFiat: boolean;

  // Client-side formatted strings
  formattedBalance: string;
  formattedValueUSD: string;
  formattedAverageCostUSD?: string;
  formattedPnl?: string;
}

// Helper to get asset price in USD, more robust
const getAssetPriceInUSD = (assetSymbol: string): number => {
  const upperSymbol = assetSymbol.toUpperCase();
  if (mockConversionRates[upperSymbol]) { // Check direct fiat conversion first
    return mockConversionRates[upperSymbol];
  }
  // Find in mockAssets (for crypto like BTC, ETH from P2P listings)
  const assetInfo = mockAssets.find(a => a.name.toUpperCase().startsWith(upperSymbol) || a.name.toUpperCase() === upperSymbol || a.id.toUpperCase() === upperSymbol);
  if (assetInfo) {
    const assetCurrencyUpper = assetInfo.currency.toUpperCase();
    if (assetCurrencyUpper === 'USD') return assetInfo.price;
    if (mockConversionRates[assetCurrencyUpper]) {
      return assetInfo.price * mockConversionRates[assetCurrencyUpper];
    }
    // Default to 1:1 if currency is USDT and USDT is 1 USD
    if (assetCurrencyUpper === 'USDT' && mockConversionRates['USDT'] === 1) {
        return assetInfo.price;
    }
  }
  // Find in depositableAssets (for icons and basic info if not in mockAssets)
  const depositableAssetInfo = depositableAssets.find(da => da.symbol.toUpperCase() === upperSymbol);
  if (depositableAssetInfo) {
    // This is tricky as depositableAssets don't have prices.
    // We'll rely on mockAssets or a default if not found.
    // For common ones not in mockAssets:
    if (upperSymbol === 'USDT') return mockConversionRates['USDT'] || 1;
  }

  // Fallback for assets not in mockAssets or common ones, like MOVE, SEI, BTTC
  // These will have mocked prices for display purposes if needed.
  // For calculation, if price is unknown, it should be handled as 0.
  // console.warn(`Price for ${assetSymbol} not found, defaulting to 0 for USD value calculation.`);
  return 0;
};


const getWalletAmountMinMaxDigits = (amount: number, assetSymbol: string) => {
  const fiatSymbols = ['USD', 'EUR', 'GBP', 'JPY'];
  if (fiatSymbols.includes(assetSymbol.toUpperCase())) return 2;
  if (amount === 0) return 2; // Show 0.00 for zero crypto balance
  if (Math.abs(amount) < 0.00000001) return 8; // Very small amounts
  if (Math.abs(amount) < 0.0001) return 6;
  return 4;
};

const formatBalanceDisplay = (amount: number, assetSymbol: string, locale: string | undefined) => {
  const digits = getWalletAmountMinMaxDigits(amount, assetSymbol);
  return amount.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const formatFiatValue = (value: number, currencyCode: string = 'USD', locale: string | undefined, options?: Intl.NumberFormatOptions) => {
  let minDigits = options?.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 2;
  let maxDigits = options?.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2;

  if (minDigits > maxDigits) {
    maxDigits = minDigits;
  }

  const formattingOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  };

  try {
    return value.toLocaleString(locale, {
        ...formattingOptions,
        style: 'currency',
        currency: currencyCode,
    });
  } catch (e) { 
    const symbol = mockCurrencies.find(c => c.id.toUpperCase() === currencyCode.toUpperCase())?.symbol || currencyCode;
    return `${symbol}${value.toLocaleString(locale, formattingOptions)}`;
  }
};

const getIconForSymbol = (symbol: string): LucideIcon | string | undefined => {
    const upperSymbol = symbol.toUpperCase();
    const asset = depositableAssets.find(da => da.symbol.toUpperCase() === upperSymbol) || mockAssets.find(ma => ma.name.toUpperCase() === upperSymbol || ma.id.toUpperCase() === upperSymbol);
    if (asset?.icon) return asset.icon;
    
    if (upperSymbol === 'MOVE') return 'https://placehold.co/32x32.png'; 
    if (upperSymbol === 'SEI') return 'https://placehold.co/32x32.png'; 
    if (upperSymbol === 'BTTC') return 'https://placehold.co/32x32.png'; 
    if (['USD', 'EUR', 'GBP', 'JPY'].includes(upperSymbol)) return DollarSign;
    return HelpCircle;
};


export default function AssetsPage() {
  const [userAssets, setUserAssets] = useState<DisplayableUserAsset[]>([]);
  const [totalPortfolioValueUSD, setTotalPortfolioValueUSD] = useState<number>(0);
  const [totalPnlTodayUSD, setTotalPnlTodayUSD] = useState<number>(0); // Mocked
  const [totalPnlTodayPercentage, setTotalPnlTodayPercentage] = useState<number>(0); // Mocked
  const [selectedDisplayCurrency, setSelectedDisplayCurrency] = useState('USD'); // For total balance
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(navigator.language);
    }
    setIsLoading(true);

    const calculatedAssetBalances: Record<string, {
      totalAmount: number;
      name: string;
      isFiat: boolean;
    }> = {};

    mockWalletTransactions.forEach(tx => {
      const symbolUpper = tx.assetSymbol.toUpperCase();
      if (!calculatedAssetBalances[symbolUpper]) {
        calculatedAssetBalances[symbolUpper] = {
          totalAmount: 0,
          name: tx.assetName,
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
    
    const imageAssets = ['ETH', 'MOVE', 'SEI', 'USDT', 'BNB', 'BTTC'];
    imageAssets.forEach(imgSymbol => {
        const upperImgSymbol = imgSymbol.toUpperCase();
        if (!calculatedAssetBalances[upperImgSymbol]) {
            const da = depositableAssets.find(d => d.symbol.toUpperCase() === upperImgSymbol);
            calculatedAssetBalances[upperImgSymbol] = {
                totalAmount: 0, 
                name: da?.name || upperImgSymbol,
                isFiat: false,
            };
        }
    });


    let runningTotalPortfolioValueUSD = 0;

    const formattedAssets = Object.entries(calculatedAssetBalances)
      .map(([symbol, assetData]) => {
        const priceInUSD = getAssetPriceInUSD(symbol) || (symbol === 'USDT' ? 1 : 0); 
        
        let currentBalance = assetData.totalAmount;
        let mockAvgCost = priceInUSD * (1 - (Math.random() * 0.1 - 0.05)); 
        let mockPnlPerc = (Math.random() * 10 - 5); 

        if (symbol === 'ETH') { currentBalance = 0.00006193; mockAvgCost = 2199.77; mockPnlPerc = 1.92;}
        else if (symbol === 'MOVE') { currentBalance = 0.0784; mockAvgCost = 0.46347305 / 0.0784 ; mockPnlPerc = 4.97;} 
        else if (symbol === 'SEI') { currentBalance = 0.01415186; mockAvgCost = 0.22215441 / 0.01415186; mockPnlPerc = 3.97;} 
        else if (symbol === 'USDT') { currentBalance = 0.0003138; mockAvgCost = 1; mockPnlPerc = 0.00; }
        else if (symbol === 'BNB') { currentBalance = 0.00000019; mockAvgCost = 367.27 / (0.00000019 * (getAssetPriceInUSD('BNB') || 580) / (getAssetPriceInUSD('BNB') || 580)); mockPnlPerc = 1.48; } 
        else if (symbol === 'BTTC') { currentBalance = 0.50; mockAvgCost = 0.00000149 / 0.50; mockPnlPerc = 1.47; }


        const valueUSD = currentBalance * priceInUSD;
        runningTotalPortfolioValueUSD += valueUSD;
        const pnlTotalUSD = valueUSD * (mockPnlPerc / 100);

        return {
          symbol: symbol,
          name: assetData.name,
          icon: getIconForSymbol(symbol),
          balance: currentBalance,
          valueUSD: valueUSD,
          averageCostUSD: mockAvgCost,
          pnlTotalUSD: pnlTotalUSD,
          pnlPercentage: mockPnlPerc,
          isFiat: assetData.isFiat,
          formattedBalance: formatBalanceDisplay(currentBalance, symbol, locale),
          formattedValueUSD: formatFiatValue(valueUSD, 'USD', locale, {minimumFractionDigits: valueUSD < 0.01 && valueUSD !== 0 ? 8 : 2}),
          formattedAverageCostUSD: mockAvgCost ? formatFiatValue(mockAvgCost, 'USD', locale) : '-',
          formattedPnl: `${pnlTotalUSD >= 0 ? '+' : ''}${formatFiatValue(pnlTotalUSD, 'USD', locale, {minimumFractionDigits:0, maximumFractionDigits:0})} (${pnlTotalUSD >= 0 ? '+' : ''}${mockPnlPerc.toFixed(2)}%)`,
        };
      })
      .filter(asset => asset.balance > 0 || asset.isFiat || imageAssets.includes(asset.symbol)) 
      .sort((a, b) => b.valueUSD - a.valueUSD); 
      
    setUserAssets(formattedAssets);
    setTotalPortfolioValueUSD(runningTotalPortfolioValueUSD);
    
    const mockTotalPnlPercentage = 2.12; 
    setTotalPnlTodayPercentage(mockTotalPnlPercentage);
    setTotalPnlTodayUSD(runningTotalPortfolioValueUSD * (mockTotalPnlPercentage / 100));
    setIsLoading(false);

  }, [locale]);


  const displayTotalPortfolioValue = useMemo(() => {
    const rate = mockConversionRates[selectedDisplayCurrency.toUpperCase()] || 1;
    const valueInSelectedCurrency = totalPortfolioValueUSD / rate;
    return formatFiatValue(valueInSelectedCurrency, selectedDisplayCurrency, locale, {minimumFractionDigits: selectedDisplayCurrency === 'USD' ? 2 : 2, maximumFractionDigits: 8});
  }, [totalPortfolioValueUSD, selectedDisplayCurrency, locale]);

  const displayTotalPnl = useMemo(() => {
    const rate = mockConversionRates[selectedDisplayCurrency.toUpperCase()] || 1;
    const pnlInSelectedCurrency = totalPnlTodayUSD / rate;
    const pnlPrefix = totalPnlTodayUSD >= 0 ? '+' : '';
    return `${pnlPrefix}${formatFiatValue(pnlInSelectedCurrency, selectedDisplayCurrency, locale, {minimumFractionDigits:2, maximumFractionDigits:2})} (${pnlPrefix}${totalPnlTodayPercentage.toFixed(2)}%)`;
  }, [totalPnlTodayUSD, totalPnlTodayPercentage, selectedDisplayCurrency, locale]);


  if (isLoading && userAssets.length === 0) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 pt-8 pb-24 flex items-center justify-center">
                <p>Loading assets...</p>
            </main>
            <BottomNavigationBar />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-6 pb-24">
        
        <div className="mb-4">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            Total Balance <Eye className="ml-2 h-4 w-4" />
          </div>
          <div className="flex items-center">
            <h1 className="text-3xl font-bold mr-2">{displayTotalPortfolioValue}</h1>
            <Select value={selectedDisplayCurrency} onValueChange={setSelectedDisplayCurrency}>
              <SelectTrigger className="w-auto h-8 text-lg font-bold border-none shadow-none focus:ring-0 !px-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockCurrencies.filter(c => c.id ==='usd' || c.id === 'eur' || c.id === 'gbp').map(currency => (
                  <SelectItem key={currency.id} value={currency.id.toUpperCase()}>{currency.id.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className={cn("text-sm", totalPnlTodayUSD >= 0 ? "text-green-600" : "text-red-600")}>
            Today's PNL {displayTotalPnl} &gt;
          </div>
        </div>

        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground h-11" asChild>
            <Link href="/wallet">Add Funds</Link>
          </Button>
          <Button variant="outline" className="h-11 text-muted-foreground border-input bg-card hover:bg-muted/50">Send</Button>
          <Button variant="outline" className="h-11 text-muted-foreground border-input bg-card hover:bg-muted/50">Transfer</Button>
        </div>

        
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-muted/20 px-2 py-3 mb-6">
          <Coins className="mr-2 h-5 w-5 text-yellow-500" />
          Convert Low-Value Assets to BNB
        </Button>

        <Separator className="mb-4"/>

        
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Balances</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        
        <div className="space-y-1">
          {userAssets.map((asset) => (
            <div key={asset.symbol} className="flex items-center py-3 px-1 hover:bg-muted/10 rounded-md">
              <div className="flex items-center flex-shrink-0 mr-3">
                {asset.icon && typeof asset.icon !== 'string' && <asset.icon className="h-8 w-8" />}
                {asset.icon && typeof asset.icon === 'string' && <Image src={asset.icon} alt={asset.name} width={32} height={32} className="rounded-full" data-ai-hint={`${asset.name} logo`} />}
                {!asset.icon && <HelpCircle className="h-8 w-8 text-muted-foreground" />}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline">
                    <span className="font-medium text-base truncate">{asset.symbol}</span>
                    <span className="font-mono text-base text-right">{asset.formattedBalance}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                    <span className="truncate">{asset.name}</span>
                    <span className="font-mono text-right">{asset.formattedValueUSD}</span>
                </div>
                {asset.averageCostUSD !== undefined && (
                    <div className="flex justify-between items-baseline text-xs mt-0.5">
                        <span className="text-muted-foreground">Average cost</span>
                        <span className="font-mono text-muted-foreground text-right">{asset.formattedAverageCostUSD}</span>
                    </div>
                )}
                {asset.pnlPercentage !== undefined && (
                     <div className="flex justify-between items-baseline text-xs">
                        <span className="text-muted-foreground">Today's PNL</span>
                        <span className={cn("font-mono text-right", (asset.pnlTotalUSD || 0) >= 0 ? "text-green-600" : "text-red-600")}>
                            {asset.formattedPnl}
                        </span>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {userAssets.length === 0 && !isLoading && (
            <div className="py-10 text-center text-muted-foreground">
                No assets to display. Deposit funds to get started.
            </div>
        )}

      </main>
      <BottomNavigationBar />
    </div>
  );
}


    