
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, MessageSquare, ShieldCheck, Clock, ArrowLeft, AlertTriangle, ShoppingCart, Tag } from 'lucide-react';
import type { Asset, MockSeller } from '@/types';
import { mockAssets, mockSellers, getAssetPriceInUSD as getAssetBasePriceInUSD, MOCK_CONVERSION_RATES, mockCurrencies } from '@/data/mock'; // Renamed to avoid conflict

const getAssetSymbol = (assetName: string): string => {
  const parts = assetName.split(" ");
  return parts[0]; 
}

const formatCryptoAmount = (amount: number, locale: string | undefined, assetSymbol?: string) => {
  let minDigits = 2;
  let maxDigits = 2;

  if (amount !== 0) {
    if (Math.abs(amount) < 0.000001) { 
      minDigits = 8;
      maxDigits = 8;
    } else if (Math.abs(amount) < 0.01) { 
      minDigits = 6;
      maxDigits = 6;
    } else if (Math.abs(amount) < 1) { 
      minDigits = 4;
      maxDigits = 4;
    }
  }
  
  const formattedAmount = amount.toLocaleString(locale, {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });
  return `${formattedAmount} ${assetSymbol || ''}`.trim();
};

// Formats the asset's original price in its native currency
const formatAssetNativePrice = (price: number, currency: string, locale: string | undefined, assetNameOrSymbol: string) => {
  const symbol = getAssetSymbol(assetNameOrSymbol); // e.g. "Bitcoin" -> "BTC"
  
  let minFractionDigitsDefault = 2;
  let maxFractionDigitsDefault = 2;

  // More precision for crypto, standard for fiat/stablecoins
  if (['BTC', 'ETH'].includes(symbol.toUpperCase())) {
    minFractionDigitsDefault = 4;
    maxFractionDigitsDefault = 8;
  } else if (!mockCurrencies.find(c => c.symbol.toUpperCase() === currency.toUpperCase() || c.id.toUpperCase() === currency.toUpperCase())) {
    // For other cryptos not in primary list, use more precision
    minFractionDigitsDefault = 2;
    maxFractionDigitsDefault = 6;
  }


  if (currency.toUpperCase() === 'USDT') {
    return `${price.toLocaleString(locale, { minimumFractionDigits: minFractionDigitsDefault, maximumFractionDigits: maxFractionDigitsDefault })} USDT`;
  }
  try {
    return price.toLocaleString(locale, { style: 'currency', currency: currency, minimumFractionDigits: minFractionDigitsDefault, maximumFractionDigits: maxFractionDigitsDefault });
  } catch (e) {
    // Fallback for unrecognized currency codes
    return `${price.toLocaleString(locale, { minimumFractionDigits: minFractionDigitsDefault, maximumFractionDigits: maxFractionDigitsDefault })} ${currency.toUpperCase()}`;
  }
};

// Formats a converted price into a target display currency
const formatConvertedDisplayPrice = (value: number, currencyCode: string, locale: string | undefined) => {
    const targetCurrencyInfo = mockCurrencies.find(c => c.id.toUpperCase() === currencyCode.toUpperCase());
    const displaySymbol = targetCurrencyInfo?.symbol || currencyCode.toUpperCase();
    
    let minFractionDigits = 2;
    let maxFractionDigits = 2;

    if (targetCurrencyInfo && targetCurrencyInfo.id.toUpperCase() !== 'USDT') { // USDT is not a standard 'currency' style
         try {
            return value.toLocaleString(locale, { style: 'currency', currency: targetCurrencyInfo.id, minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits });
        } catch (e) {
            // Fallback if currency style fails
            return `${value.toLocaleString(locale, { minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits })} ${displaySymbol}`;
        }
    }
    // For USDT or if style:'currency' fails or not applicable
    return `${value.toLocaleString(locale, { minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits })} ${displaySymbol}`;
};


export default function FindSellerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const assetId = typeof params.assetId === 'string' ? params.assetId : '';
  const displayCurrencyId = searchParams.get('displayCurrency') || 'usd'; // Default to 'usd'

  const [asset, setAsset] = useState<Asset | null | undefined>(undefined); 
  const [locale, setLocale] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(navigator.language);
    }
  }, []);

  useEffect(() => {
    if (assetId) {
      const foundAsset = mockAssets.find(a => a.id === assetId);
      setAsset(foundAsset || null);
    }
  }, [assetId]);

  const assetPriceInUSD = useMemo(() => {
    if (!asset) return 0;
    return getAssetBasePriceInUSD(asset.id, mockAssets); 
  }, [asset]);


  if (asset === undefined) { // Still loading asset data
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 pt-8 pb-20 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Loading asset details...</p>
        </main>
        <BottomNavigationBar />
      </div>
    );
  }

  if (asset === null) { // Asset not found after attempting to load
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 pt-8 pb-20">
           <div className="mb-6">
            <Button variant="outline" asChild className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Asset Not Found</AlertTitle>
              <AlertDescription>
                The asset you are looking for could not be found. It might have been removed or the link is incorrect.
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <BottomNavigationBar />
      </div>
    );
  }
  
  const assetSymbolDisplay = getAssetSymbol(asset.name);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            {asset.icon && typeof asset.icon !== 'string' && <asset.icon className="h-10 w-10 text-primary" />}
            {typeof asset.icon === 'string' && <Image src={asset.icon} alt={asset.name} width={40} height={40} className="rounded-full" data-ai-hint={`${asset.name} logo`} />}
            <h1 className="text-3xl font-headline font-bold">Sellers for {asset.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSellers.map((seller) => {
            const minSellInAsset = assetPriceInUSD > 0 ? seller.minSellUSD / assetPriceInUSD : 0;
            const maxSellInAsset = assetPriceInUSD > 0 ? seller.maxSellUSD / assetPriceInUSD : 0;
            
            const targetRateToUSD = MOCK_CONVERSION_RATES[displayCurrencyId.toUpperCase()];
            let minSellInDisplayCurrencyFormatted: string | null = null;
            let maxSellInDisplayCurrencyFormatted: string | null = null;

            if (targetRateToUSD && displayCurrencyId.toLowerCase() !== 'usd') {
                const minSellInDisplayCurrency = seller.minSellUSD / targetRateToUSD;
                const maxSellInDisplayCurrency = seller.maxSellUSD / targetRateToUSD;
                minSellInDisplayCurrencyFormatted = formatConvertedDisplayPrice(minSellInDisplayCurrency, displayCurrencyId, locale);
                maxSellInDisplayCurrencyFormatted = formatConvertedDisplayPrice(maxSellInDisplayCurrency, displayCurrencyId, locale);
            }
            const displayCurrencyInfo = mockCurrencies.find(c => c.id.toLowerCase() === displayCurrencyId.toLowerCase());
            const displayCurrencyName = displayCurrencyInfo?.name || displayCurrencyId.toUpperCase();
            // const displayCurrencySymbol = displayCurrencyInfo?.symbol || displayCurrencyId.toUpperCase(); // Not used
            
            let desiredPriceInAssetCurrencyFormatted: string | null = null;
            let desiredPriceInSelectedDisplayCurrencyFormatted: string | null = null;

            if (seller.desiredPricePerAssetUSD !== undefined) {
              // Convert seller's USD desired price to the asset's original currency (e.g., USDT, EUR)
              const assetOriginalCurrencyRateToUSD = MOCK_CONVERSION_RATES[asset.currency.toUpperCase()] || (asset.currency.toUpperCase() === 'USD' ? 1 : 0);
              if (assetOriginalCurrencyRateToUSD > 0) {
                const desiredPriceInAssetOriginalCurrency = seller.desiredPricePerAssetUSD / assetOriginalCurrencyRateToUSD;
                desiredPriceInAssetCurrencyFormatted = formatAssetNativePrice(desiredPriceInAssetOriginalCurrency, asset.currency, locale, assetSymbolDisplay);
              } else if (asset.currency.toUpperCase() === 'USDT' && MOCK_CONVERSION_RATES['USDT'] === 1) { // Handle USDT case directly
                desiredPriceInAssetCurrencyFormatted = formatAssetNativePrice(seller.desiredPricePerAssetUSD, 'USDT', locale, assetSymbolDisplay);
              }


              // Convert seller's USD desired price to the user's selected display currency
              if (targetRateToUSD) {
                const desiredPriceInSelectedDisplay = seller.desiredPricePerAssetUSD / targetRateToUSD;
                desiredPriceInSelectedDisplayCurrencyFormatted = formatConvertedDisplayPrice(desiredPriceInSelectedDisplay, displayCurrencyId, locale);
              } else if (displayCurrencyId.toUpperCase() === 'USD') { // If display currency is USD
                 desiredPriceInSelectedDisplayCurrencyFormatted = formatConvertedDisplayPrice(seller.desiredPricePerAssetUSD, 'USD', locale);
              }
            }


            return (
              <Card key={seller.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 pb-2 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-primary" />
                      <CardTitle className="text-lg font-semibold">{seller.name}</CardTitle>
                    </div>
                    {asset.seller === seller.name && ( 
                      <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">Original Lister</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3 text-sm">
                  {seller.reputation !== undefined && (
                    <div className="flex items-center text-muted-foreground">
                      <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                      Reputation: {seller.reputation}%
                    </div>
                  )}
                  {seller.avgTradeTime && (
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4 text-blue-500" />
                      Avg. Trade Time: {seller.avgTradeTime}
                    </div>
                  )}
                  
                  {/* Seller's Desired Price */}
                  {desiredPriceInAssetCurrencyFormatted && (
                    <div className="flex items-center text-muted-foreground">
                      <Tag className="mr-2 h-4 w-4 text-teal-500" />
                      Asking Price: {desiredPriceInAssetCurrencyFormatted}
                       {desiredPriceInSelectedDisplayCurrencyFormatted && desiredPriceInAssetCurrencyFormatted !== desiredPriceInSelectedDisplayCurrencyFormatted && asset.currency.toUpperCase() !== displayCurrencyId.toUpperCase() && (
                        <span className="ml-1 text-xs">
                          ({desiredPriceInSelectedDisplayCurrencyFormatted})
                        </span>
                      )}
                       {!desiredPriceInSelectedDisplayCurrencyFormatted && displayCurrencyId.toUpperCase() !== 'USD' && asset.currency.toUpperCase() === 'USDT' && seller.desiredPricePerAssetUSD !== undefined && (
                           <span className="ml-1 text-xs">
                             ({formatConvertedDisplayPrice(seller.desiredPricePerAssetUSD, 'USD', locale)})
                           </span>
                       )}

                    </div>
                  )}


                  <div className="flex items-center text-muted-foreground">
                     <ShoppingCart className="mr-2 h-4 w-4 text-orange-500" />
                     Sell Range (USD): ${seller.minSellUSD.toLocaleString(locale, {minimumFractionDigits:0, maximumFractionDigits:0})} - ${seller.maxSellUSD.toLocaleString(locale, {minimumFractionDigits:0, maximumFractionDigits:0})}
                  </div>
                  {minSellInDisplayCurrencyFormatted && maxSellInDisplayCurrencyFormatted && displayCurrencyId.toLowerCase() !== 'usd' && (
                    <div className="flex items-center text-muted-foreground">
                      <ShoppingCart className="mr-2 h-4 w-4 text-purple-500" />
                      Sell Range ({displayCurrencyName}): {minSellInDisplayCurrencyFormatted} - {maxSellInDisplayCurrencyFormatted}
                    </div>
                  )}
                  {assetPriceInUSD > 0 && ( 
                     <div className="flex items-center text-muted-foreground">
                        <ShoppingCart className="mr-2 h-4 w-4 text-indigo-500" />
                        Sell Range ({assetSymbolDisplay}): {formatCryptoAmount(minSellInAsset, locale)} - {formatCryptoAmount(maxSellInAsset, locale, assetSymbolDisplay)}
                     </div>
                  )}
                  <Button 
                    asChild
                    size="sm" 
                    className="w-full mt-3"
                  >
                    <Link href={`/chat/${asset.id}/${seller.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat with {seller.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {mockSellers.length === 0 && (
            <p className="text-center text-muted-foreground py-10 text-lg">No other sellers found for this asset currently.</p>
        )}
      </main>
      <BottomNavigationBar />
    </div>
  );
}
