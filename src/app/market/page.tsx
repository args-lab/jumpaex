
'use client';

import React from 'react'; // Added this line
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { P2POfferCard } from '@/components/app/p2p-offer-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { mockP2POffers, mockCurrencies, mockPaymentMethods, depositableAssets } from '@/data/mock';
import type { P2POffer, Currency, PaymentMethod, DepositableAsset } from '@/types';
import { Info, Diamond, SlidersHorizontal, Bell, Filter, ChevronDown } from 'lucide-react';

// Helper to get unique crypto assets from offers for the filter
const getAvailableCryptoAssets = (offers: P2POffer[]): DepositableAsset[] => {
  const uniqueSymbols = new Set(offers.map(offer => offer.cryptoAssetSymbol));
  return depositableAssets.filter(da => uniqueSymbols.has(da.symbol));
};

export default function MarketPage() {
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState<string>(mockCurrencies.find(c => c.id === 'idr')?.id || mockCurrencies[0].id);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  
  const availableCryptoAssets = useMemo(() => getAvailableCryptoAssets(mockP2POffers), []);
  const [selectedCryptoAsset, setSelectedCryptoAsset] = useState<string>(availableCryptoAssets[0]?.symbol || 'USDT');
  
  // Placeholder states for other filters - functionality to be fully implemented later
  const [selectedAmountRange, setSelectedAmountRange] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');

  const [locale, setLocale] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(navigator.language);
    }
  }, []);

  const filteredOffers = useMemo(() => {
    return mockP2POffers.filter(offer => {
      const fiatMatch = offer.fiatCurrency.toLowerCase() === selectedFiatCurrency.toLowerCase();
      const cryptoMatch = offer.cryptoAssetSymbol.toLowerCase() === selectedCryptoAsset.toLowerCase();
      // Add more filtering logic here based on amount, payment method, tradeType (buy/sell)
      // For now, basic filtering:
      return fiatMatch && cryptoMatch;
    });
  }, [selectedFiatCurrency, selectedCryptoAsset, /* selectedAmountRange, selectedPaymentMethod, tradeType */]);

  const currentFiatCurrencyDetails = mockCurrencies.find(c => c.id === selectedFiatCurrency);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 pt-4 pb-24">
        {/* Top Bar: Title and Fiat Currency Selector */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-headline font-bold">Express P2P</h1>
          <Select value={selectedFiatCurrency} onValueChange={setSelectedFiatCurrency}>
            <SelectTrigger className="w-auto min-w-[80px] text-xs h-8">
              <SelectValue placeholder="Fiat" />
            </SelectTrigger>
            <SelectContent>
              {mockCurrencies.map(currency => (
                <SelectItem key={currency.id} value={currency.id} className="text-xs">
                  {currency.symbol} ({currency.id.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional KYC Banner */}
        <Alert className="mb-4 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20 dark:border-yellow-600/50">
          <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-700 dark:text-yellow-300 text-sm">Heads up!</AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-400 text-xs">
            Complete KYC to make your first trade. <a href="#" className="underline font-medium">Verify Now &gt;</a>
          </AlertDescription>
        </Alert>

        {/* Buy/Sell Toggle and Filter Icons */}
        <div className="flex justify-between items-center mb-4">
          <RadioGroup
            onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}
            value={tradeType}
            className="flex space-x-1 bg-muted p-1 rounded-md"
          >
            <RadioGroupItem value="buy" id="r_buy_market" className="sr-only peer" />
            <Label htmlFor="r_buy_market" className="px-4 py-1.5 text-sm rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=unchecked]:hover:bg-muted-foreground/10">
              Buy
            </Label>
            <RadioGroupItem value="sell" id="r_sell_market" className="sr-only peer" />
            <Label htmlFor="r_sell_market" className="px-4 py-1.5 text-sm rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=unchecked]:hover:bg-muted-foreground/10">
              Sell
            </Label>
          </RadioGroup>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filters</span>
            </Button>
          </div>
        </div>
        
        {/* Filter Controls: Asset, Amount, Payment */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          <Select value={selectedCryptoAsset} onValueChange={setSelectedCryptoAsset}>
            <SelectTrigger className="h-9 text-xs">
              <div className="flex items-center">
                {depositableAssets.find(da => da.symbol === selectedCryptoAsset)?.icon && typeof depositableAssets.find(da => da.symbol === selectedCryptoAsset)!.icon !== 'string' ? 
                  React.createElement(depositableAssets.find(da => da.symbol === selectedCryptoAsset)!.icon as React.ElementType, { className: "mr-1.5 h-4 w-4 text-primary" })
                  : <Diamond className="mr-1.5 h-4 w-4 text-primary" />
                }
                <SelectValue placeholder="Asset" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {availableCryptoAssets.map(asset => (
                <SelectItem key={asset.id} value={asset.symbol} className="text-xs">
                  <div className="flex items-center">
                    {asset.icon && typeof asset.icon !== 'string' ? 
                      React.createElement(asset.icon as React.ElementType, { className: "mr-2 h-4 w-4" })
                       : <Diamond className="mr-2 h-4 w-4" />
                    }
                    {asset.symbol}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAmountRange} onValueChange={setSelectedAmountRange}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Amount" />
            </SelectTrigger>
            <SelectContent>
              {/* TODO: Populate with actual amount ranges */}
              <SelectItem value="all" className="text-xs">All Amounts</SelectItem>
              <SelectItem value="1-100" className="text-xs">1 - 100 {currentFiatCurrencyDetails?.symbol}</SelectItem>
              <SelectItem value="101-500" className="text-xs">101 - 500 {currentFiatCurrencyDetails?.symbol}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Payment Methods</SelectItem>
              {mockPaymentMethods.map(pm => (
                 <SelectItem key={pm.id} value={pm.id} className="text-xs">{pm.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional "New P2P User Trading Zone" Banner */}
        <div className="mb-4 text-center">
          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
            New P2P User Trading Zone
          </span>
        </div>
        
        {/* Offer Listings */}
        <div className="space-y-3">
          {filteredOffers.length > 0 ? (
            filteredOffers.map(offer => (
              <P2POfferCard 
                key={offer.id} 
                offer={offer} 
                locale={locale} 
                tradeType={tradeType}
              />
            ))
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              No offers found for the selected criteria.
            </div>
          )}
        </div>
      </main>
      <BottomNavigationBar />
    </div>
  );
}
