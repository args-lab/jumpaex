
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/app/header'; // Assuming a generic header, or create a specific one
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowLeft, HelpCircle, ShieldAlert, MessageSquare } from 'lucide-react';
import type { P2POffer, Currency, DepositableAsset } from '@/types';
import { mockCurrencies, depositableAssets } from '@/data/mock'; // For formatting helpers

// Helper to format fiat currency
const formatFiatDisplay = (value: number, currencyCode: string, locale: string | undefined, showSymbol = true): string => {
  if (isNaN(value) || !isFinite(value)) return `${showSymbol ? (mockCurrencies.find(c=>c.id.toUpperCase() === currencyCode.toUpperCase())?.symbol || currencyCode) : ''}0.00`;
  const targetCurrencyInfo = mockCurrencies.find(c => c.id.toUpperCase() === currencyCode.toUpperCase() || c.symbol.toUpperCase() === currencyCode.toUpperCase());
  const displaySymbol = targetCurrencyInfo?.symbol || currencyCode.toUpperCase();
  const fractionDigits = currencyCode.toUpperCase() === 'IDR' ? 0 : 2;

  if (showSymbol && targetCurrencyInfo && targetCurrencyInfo.id.toUpperCase() !== 'USDT') {
    try {
      return value.toLocaleString(locale, { style: 'currency', currency: targetCurrencyInfo.id, minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
    } catch (e) {
      return `${value.toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })} ${displaySymbol}`;
    }
  }
  return `${value.toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}${showSymbol ? ` ${displaySymbol}` : ''}`;
};

// Helper to format crypto currency
const formatCryptoDisplay = (value: number, symbol: string, locale: string | undefined, showSymbol = true): string => {
  if (isNaN(value) || !isFinite(value)) return `0.00${showSymbol ? ` ${symbol}` : ''}`;
  let precision = 6;
  if (Math.abs(value) > 0 && Math.abs(value) < 0.000001) precision = 8;
  else if (Math.abs(value) > 0 && Math.abs(value) < 0.01) precision = 6;
  else if (Math.abs(value) > 0 && Math.abs(value) < 1) precision = 4;
  else precision = 2;
  
  return `${value.toLocaleString(locale, { minimumFractionDigits: precision, maximumFractionDigits: 8 })}${showSymbol ? ` ${symbol}` : ''}`;
};

interface OrderDetails {
  orderId: string;
  fiatAmount: number;
  cryptoAmount: number;
  pricePerCrypto: number;
  fiatCurrency: string;
  cryptoAssetSymbol: string;
  sellerName: string;
  sellerAvatarInitial: string;
  paymentMethod: string; 
  advertiserRequirements: string;
  assetId: string;
  sellerId: string;
  tradeType: 'buy' | 'sell';
  cryptoAssetIcon?: string; 
}

function OrderCreatedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams(); // Not strictly needed for orderId if always in query, but good for robustness
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [locale, setLocale] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(navigator.language);
    }

    const queryData = Object.fromEntries(searchParams.entries());
    if (queryData.fiatAmount && queryData.cryptoAssetSymbol) {
      const cryptoAsset = depositableAssets.find(da => da.symbol === queryData.cryptoAssetSymbol);
      let iconPath: string | undefined = undefined;
      if (cryptoAsset?.icon && typeof cryptoAsset.icon === 'string') {
        iconPath = cryptoAsset.icon;
      }
      
      setOrderDetails({
        orderId: queryData.orderId || `err_ord_${Date.now()}`, // Get orderId from query
        fiatAmount: parseFloat(queryData.fiatAmount),
        cryptoAmount: parseFloat(queryData.cryptoAmount),
        pricePerCrypto: parseFloat(queryData.pricePerCrypto),
        fiatCurrency: queryData.fiatCurrency,
        cryptoAssetSymbol: queryData.cryptoAssetSymbol,
        sellerName: queryData.sellerName,
        sellerAvatarInitial: queryData.sellerAvatarInitial,
        paymentMethod: queryData.paymentMethod || 'Not specified',
        advertiserRequirements: queryData.advertiserRequirements || 'No specific terms.',
        assetId: queryData.assetId,
        sellerId: queryData.sellerId,
        tradeType: queryData.tradeType as 'buy' | 'sell',
        cryptoAssetIcon: iconPath,
      });
    } else {
      // router.push('/market'); 
    }
  }, [searchParams, router, params]);

  if (!orderDetails) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }
  
  const CryptoAssetSelfIcon = depositableAssets.find(da => da.symbol === orderDetails.cryptoAssetSymbol)?.icon;

  const chatLinkHref = `/chat/${orderDetails.assetId}/${orderDetails.sellerId}?` +
  `tradeType=${orderDetails.tradeType}` +
  `&fiatAmount=${orderDetails.fiatAmount}` +
  `&cryptoAmount=${orderDetails.cryptoAmount}` +
  `&fiatCurrency=${orderDetails.fiatCurrency}` +
  `&cryptoAssetSymbol=${orderDetails.cryptoAssetSymbol}` +
  `&pricePerCrypto=${orderDetails.pricePerCrypto}` +
  `&orderId=${orderDetails.orderId}` + // Pass orderId
  `&sellerName=${encodeURIComponent(orderDetails.sellerName)}` +
  `&sellerAvatarInitial=${encodeURIComponent(orderDetails.sellerAvatarInitial)}`;


  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Order Created</h1>
          <Button variant="link" className="text-sm text-muted-foreground" onClick={() => alert("Cancel Order (Mock)")}>
            Cancel the Order
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">Pay within <span className="text-foreground font-medium">14:31</span></p>
        </div>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {orderDetails.sellerAvatarInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{orderDetails.sellerName}</p>
                <Badge variant="outline" className="text-xs py-0.5 px-1.5 border-green-500 text-green-600 bg-green-500/10">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  Escrowed Crypto
                </Badge>
              </div>
            </div>
            <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs h-7 px-3 relative" asChild>
              <Link href={chatLinkHref}>
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Chat
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 items-center justify-center text-white text-[8px]">2</span>
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full space-y-0.5">
          <AccordionItem value="item-1" className="bg-background border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 text-base hover:no-underline">
              <div className="flex items-center">
                {CryptoAssetSelfIcon && typeof CryptoAssetSelfIcon !== 'string' && (
                    <CryptoAssetSelfIcon className="h-6 w-6 mr-2 text-primary" />
                )}
                {CryptoAssetSelfIcon && typeof CryptoAssetSelfIcon === 'string' && (
                    <Image src={CryptoAssetSelfIcon} alt={orderDetails.cryptoAssetSymbol} width={24} height={24} className="mr-2 rounded-full" />
                )}
                {orderDetails.tradeType === 'buy' ? 'Buy' : 'Sell'} {orderDetails.cryptoAssetSymbol}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fiat Amount</span>
                  <span>{formatFiatDisplay(orderDetails.fiatAmount, orderDetails.fiatCurrency, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span>{formatFiatDisplay(orderDetails.pricePerCrypto, orderDetails.fiatCurrency, locale)} / {orderDetails.cryptoAssetSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receive Quantity</span>
                  <span>{formatCryptoDisplay(orderDetails.cryptoAmount, orderDetails.cryptoAssetSymbol, locale)}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-xs">{orderDetails.orderId}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-background border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 text-base hover:no-underline">Payment Method</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <p className="text-sm">{orderDetails.paymentMethod}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-background border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 text-base hover:no-underline">Advertiser's Terms</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <p className="text-sm whitespace-pre-wrap">{orderDetails.advertiserRequirements}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </main>

      <footer className="sticky bottom-0 bg-background border-t p-4 space-y-2 z-10">
        <Button className="w-full h-12 text-base bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => alert("View Payment Details (Mock)")}>
            View Payment Details
        </Button>
        <Button variant="ghost" size="sm" className="absolute bottom-16 right-4 h-10 w-10 p-0 rounded-full bg-card shadow-md">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
      </footer>
    </div>
  );
}

export default function OrderCreatedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderCreatedContent />
    </Suspense>
  );
}
