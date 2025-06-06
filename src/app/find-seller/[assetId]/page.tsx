
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { ChatModal } from '@/components/app/chat-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, MessageSquare, ShieldCheck, Clock, ArrowLeft, AlertTriangle, ShoppingCart } from 'lucide-react';
import type { Asset, MockSeller, BlockchainNetwork } from '@/types';
import { mockAssets, mockSellers, mockBlockchainNetworks, getAssetPriceInUSD } from '@/data/mock';
import Link from 'next/link';

const getAssetSymbol = (assetName: string): string => {
  const parts = assetName.split(" ");
  return parts[0]; // e.g., "Bitcoin" -> "Bitcoin", "USD Coin" -> "USD" (simple heuristic)
}

// Helper to format amount client-side with appropriate precision for crypto
const formatCryptoAmount = (amount: number, locale: string | undefined, assetSymbol?: string) => {
  let minDigits = 2;
  let maxDigits = 2;

  if (amount !== 0) {
    if (Math.abs(amount) < 0.000001) { // Very small amounts
      minDigits = 8;
      maxDigits = 8;
    } else if (Math.abs(amount) < 0.01) { // Small amounts
      minDigits = 6;
      maxDigits = 6;
    } else if (Math.abs(amount) < 1) { // Amounts less than 1
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

// Helper to format asset price
const formatAssetPrice = (price: number, currency: string, locale: string | undefined, assetName: string) => {
  const symbol = getAssetSymbol(assetName);
  const minFractionDigits = symbol === 'BTC' || symbol === 'ETH' ? 4 : 2;
  
  if (currency.toUpperCase() === 'USDT') {
    return `${price.toLocaleString(locale, { minimumFractionDigits, maximumFractionDigits: minFractionDigits })} USDT`;
  }
  try {
    return price.toLocaleString(locale, { style: 'currency', currency: currency, minimumFractionDigits });
  } catch (e) {
    // Fallback for non-standard currency codes
    return `${price.toLocaleString(locale, { minimumFractionDigits, maximumFractionDigits: minFractionDigits })} ${currency.toUpperCase()}`;
  }
};


export default function FindSellerPage() {
  const params = useParams();
  const assetId = typeof params.assetId === 'string' ? params.assetId : '';

  const [asset, setAsset] = useState<Asset | null | undefined>(undefined); // undefined for loading, null if not found
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
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

  const handleChatWithSellerClick = (seller: MockSeller) => {
    // The asset for the chat is the current page's asset
    setIsChatModalOpen(true);
  };

  const assetPriceInUSD = useMemo(() => {
    if (!asset) return 0;
    return getAssetPriceInUSD(asset.id, mockAssets);
  }, [asset]);

  if (asset === undefined) {
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

  if (asset === null) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 pt-8 pb-20">
           <div className="mb-6">
            <Button variant="outline" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
              </Link>
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
  const displayAssetPrice = formatAssetPrice(asset.price, asset.currency, locale, asset.name);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
            </Link>
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            {asset.icon && typeof asset.icon !== 'string' && <asset.icon className="h-10 w-10 text-primary" />}
            {typeof asset.icon === 'string' && <Image src={asset.icon} alt={asset.name} width={40} height={40} className="rounded-full" data-ai-hint={`${asset.name} logo`} />}
            <h1 className="text-3xl font-headline font-bold">Sellers for {asset.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Find sellers offering {asset.name}. Current price approx: {displayAssetPrice}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSellers.map((seller) => {
            const minSellInAsset = assetPriceInUSD > 0 ? seller.minSellUSD / assetPriceInUSD : 0;
            const maxSellInAsset = assetPriceInUSD > 0 ? seller.maxSellUSD / assetPriceInUSD : 0;
            
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
                  <div className="flex items-center text-muted-foreground">
                     <ShoppingCart className="mr-2 h-4 w-4 text-orange-500" />
                     Sell Range (USD): ${seller.minSellUSD.toLocaleString(locale, {minimumFractionDigits:0})} - ${seller.maxSellUSD.toLocaleString(locale, {minimumFractionDigits:0})}
                  </div>
                  {assetPriceInUSD > 0 && (
                     <div className="flex items-center text-muted-foreground">
                        <ShoppingCart className="mr-2 h-4 w-4 text-indigo-500" />
                        Sell Range ({assetSymbolDisplay}): {formatCryptoAmount(minSellInAsset, locale)} - {formatCryptoAmount(maxSellInAsset, locale, assetSymbolDisplay)}
                     </div>
                  )}
                   <Button 
                      onClick={() => handleChatWithSellerClick(seller)} 
                      size="sm" 
                      className="w-full mt-3"
                  >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat with {seller.name}
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
      <ChatModal
        isOpen={isChatModalOpen}
        onOpenChange={setIsChatModalOpen}
        asset={asset} 
      />
      <BottomNavigationBar />
    </div>
  );
}
