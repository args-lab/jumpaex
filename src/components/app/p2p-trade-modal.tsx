
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } // Added useRouter
from 'next/navigation'; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; 
import { ArrowLeft, ChevronRight, ShieldCheck, Info, RefreshCcw, Loader2 } from 'lucide-react'; // Added Loader2
import type { P2POffer, Currency } from '@/types';
import { mockCurrencies, depositableAssets } from '@/data/mock';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';


interface P2PTradeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  offer: P2POffer;
  tradeType: 'buy' | 'sell';
  locale: string | undefined;
}

const formatFiatDisplay = (value: number, currencyCode: string, locale: string | undefined, showSymbol = true): string => {
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

const formatCryptoDisplay = (value: number, symbol: string, locale: string | undefined, showSymbol = true): string => {
  if (isNaN(value) || !isFinite(value)) return `0.00${showSymbol ? ` ${symbol}` : ''}`;
  let precision = 6;
  if (Math.abs(value) > 0 && Math.abs(value) < 0.000001) precision = 8;
  else if (Math.abs(value) > 0 && Math.abs(value) < 0.01) precision = 6;
  else if (Math.abs(value) > 0 && Math.abs(value) < 1) precision = 4;
  else precision = 2;
  
  return `${value.toLocaleString(locale, { minimumFractionDigits: precision, maximumFractionDigits: 8 })}${showSymbol ? ` ${symbol}` : ''}`;
};

export function P2PTradeModal({
  isOpen,
  onOpenChange,
  offer,
  tradeType,
  locale,
}: P2PTradeModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [inputMode, setInputMode] = useState<'fiat' | 'crypto'>('fiat');
  const [inputValue, setInputValue] = useState<string>('');
  
  const [calculatedFiatAmount, setCalculatedFiatAmount] = useState<number>(0);
  const [calculatedCryptoAmount, setCalculatedCryptoAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);


  const cryptoAssetDetails = depositableAssets.find(da => da.symbol === offer.cryptoAssetSymbol);

  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
      setInputMode('fiat');
      setCalculatedFiatAmount(0);
      setCalculatedCryptoAmount(0);
      setIsProcessing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue) || numericValue <= 0) {
      setCalculatedFiatAmount(0);
      setCalculatedCryptoAmount(0);
      return;
    }

    if (inputMode === 'fiat') {
      setCalculatedFiatAmount(numericValue);
      const cryptoEquivalent = numericValue / offer.pricePerCrypto;
      setCalculatedCryptoAmount(cryptoEquivalent);
    } else { // inputMode === 'crypto'
      setCalculatedCryptoAmount(numericValue);
      const fiatEquivalent = numericValue * offer.pricePerCrypto;
      setCalculatedFiatAmount(fiatEquivalent);
    }
  }, [inputValue, inputMode, offer, locale]);

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    
    const numericInputValue = parseFloat(inputValue);
    if (isNaN(numericInputValue) || numericInputValue <= 0) {
        toast({ title: "Invalid Amount", description: "Please enter a valid amount.", variant: "destructive" });
        setIsProcessing(false);
        return;
    }

    let finalFiatAmount = 0;
    let finalCryptoAmount = 0;

    if (inputMode === 'fiat') {
        finalFiatAmount = numericInputValue;
        finalCryptoAmount = numericInputValue / offer.pricePerCrypto;
    } else {
        finalCryptoAmount = numericInputValue;
        finalFiatAmount = numericInputValue * offer.pricePerCrypto;
    }
    
    // Validate limits based on fiat amount
    if (finalFiatAmount < offer.minLimitFiat || finalFiatAmount > offer.maxLimitFiat) {
        toast({
            title: "Amount Out of Range",
            description: `Amount must be between ${formatFiatDisplay(offer.minLimitFiat, offer.fiatCurrency, locale)} and ${formatFiatDisplay(offer.maxLimitFiat, offer.fiatCurrency, locale)}.`,
            variant: "destructive"
        });
        setIsProcessing(false);
        return;
    }


    // Construct query parameters
    const queryParams = new URLSearchParams({
      orderId: `mock_${Date.now()}`, // Mock order ID
      fiatAmount: finalFiatAmount.toString(),
      cryptoAmount: finalCryptoAmount.toString(),
      pricePerCrypto: offer.pricePerCrypto.toString(),
      fiatCurrency: offer.fiatCurrency,
      cryptoAssetSymbol: offer.cryptoAssetSymbol,
      sellerName: offer.sellerName,
      sellerAvatarInitial: offer.sellerAvatarInitial,
      paymentMethod: offer.paymentMethods[0] || 'Bank Transfer', // Default to first or a generic one
      advertiserRequirements: offer.advertiserRequirements || '',
      assetId: cryptoAssetDetails?.id || offer.cryptoAssetSymbol, // Use a real asset ID if available
      sellerId: `mockSeller_${offer.sellerName.replace(/\s+/g, '')}`, // Mock seller ID
      tradeType: tradeType,
    });
    
    // Simulate API call and then navigate
    setTimeout(() => {
        router.push(`/order-created/mockOrderId?${queryParams.toString()}`);
        onOpenChange(false); // Close current modal
        // setIsProcessing(false); // Already closed
    }, 1000);
  };

  const handleMax = () => {
    if (inputMode === 'fiat') {
      setInputValue(offer.maxLimitFiat.toString());
    } else {
      // If selling, availableCrypto is the limit. If buying, maxLimitFiat converted to crypto.
      const cryptoLimitBasedOnFiat = offer.maxLimitFiat / offer.pricePerCrypto;
      const maxCrypto = tradeType === 'sell' ? Math.min(cryptoLimitBasedOnFiat, offer.availableCrypto) : cryptoLimitBasedOnFiat;
      setInputValue(maxCrypto.toFixed(8)); // Using a fixed precision
    }
  };

  const CryptoIcon = cryptoAssetDetails?.icon;

  const displayReceivePayLabel = inputMode === 'fiat' 
    ? (tradeType === 'buy' ? 'You Receive (approx.):' : 'You Pay (approx.):')
    : (tradeType === 'buy' ? 'You Pay (approx.):' : 'You Receive (approx.):');
  
  const displayCalculatedAmount = inputMode === 'fiat' 
    ? formatCryptoDisplay(calculatedCryptoAmount, offer.cryptoAssetSymbol, locale)
    : formatFiatDisplay(calculatedFiatAmount, offer.fiatCurrency, locale);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8" disabled={isProcessing}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col items-center">
            <DialogTitle className="font-headline text-lg flex items-center">
              {CryptoIcon && typeof CryptoIcon !== 'string' && <CryptoIcon className="h-5 w-5 mr-2 text-primary" />}
              {CryptoIcon && typeof CryptoIcon === 'string' && <Image src={CryptoIcon} alt={offer.cryptoAssetSymbol} width={20} height={20} className="mr-2 rounded-full" data-ai-hint={`${offer.cryptoAssetSymbol} logo`} />}
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {offer.cryptoAssetSymbol}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Price: {formatFiatDisplay(offer.pricePerCrypto, offer.fiatCurrency, locale)}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 opacity-60 hover:opacity-100" disabled={isProcessing}><RefreshCcw className="h-3 w-3" /></Button>
            </DialogDescription>
          </div>
          <div className="w-8"></div>{/* Spacer */}
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-4 space-y-6">
          <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as 'fiat' | 'crypto')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger value="fiat" className="py-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm" disabled={isProcessing}>By {offer.fiatCurrency}</TabsTrigger>
              <TabsTrigger value="crypto" className="py-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm" disabled={isProcessing}>By {offer.cryptoAssetSymbol}</TabsTrigger>
            </TabsList>
            <TabsContent value="fiat" className="mt-0">
              <div className="relative mt-4">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={inputMode === 'fiat' ? inputValue : ''}
                  onChange={(e) => inputMode === 'fiat' && setInputValue(e.target.value)}
                  className="h-16 text-3xl font-bold pr-20 text-left pl-4 bg-muted/30 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isProcessing}
                />
                <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xl font-medium text-muted-foreground">{offer.fiatCurrency}</span>
                <Button variant="ghost" onClick={handleMax} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary h-auto px-2 py-1 text-sm" disabled={isProcessing}>Max</Button>
              </div>
            </TabsContent>
            <TabsContent value="crypto" className="mt-0">
               <div className="relative mt-4">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={inputMode === 'crypto' ? inputValue : ''}
                  onChange={(e) => inputMode === 'crypto' && setInputValue(e.target.value)}
                  className="h-16 text-3xl font-bold pr-24 text-left pl-4 bg-muted/30 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isProcessing}
                />
                <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xl font-medium text-muted-foreground">{offer.cryptoAssetSymbol}</span>
                <Button variant="ghost" onClick={handleMax} className="absolute right-2 top-1/2 -translatey-1/2 text-primary h-auto px-2 py-1 text-sm" disabled={isProcessing}>Max</Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="text-xs text-muted-foreground px-1">
            Limit: {formatFiatDisplay(offer.minLimitFiat, offer.fiatCurrency, locale, false)} - {formatFiatDisplay(offer.maxLimitFiat, offer.fiatCurrency, locale)}
          </div>
          {(calculatedFiatAmount > 0 || calculatedCryptoAmount > 0) && (
             <div className="text-sm px-1">
               {displayReceivePayLabel} <span className="font-semibold">{displayCalculatedAmount}</span>
             </div>
          )}


          <Separator />

          <Button variant="outline" className="w-full justify-between h-auto py-3" disabled={isProcessing}>
            <span className="text-sm">Select Payment Method</span>
            <div className="flex items-center">
              <Badge variant="secondary" className="mr-2">{offer.paymentMethods.length}</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-2">Advertiser's Requirements</h3>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">{offer.sellerAvatarInitial}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{offer.sellerName}</span>
                {offer.isSellerVerified && <ShieldCheck className="h-4 w-4 ml-1 text-yellow-500" />}
              </div>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-green-600" disabled={isProcessing}>
                <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>
                Online
                <ChevronRight className="h-3 w-3 ml-0.5 text-muted-foreground" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground whitespace-pre-wrap p-3 bg-muted/30 rounded-md">
              {offer.advertiserRequirements || "No specific requirements provided by the advertiser."}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t sticky bottom-0 bg-background z-10">
          <Button 
            className="w-full h-12 text-base bg-green-500 hover:bg-green-600 text-white" 
            onClick={handlePlaceOrder}
            disabled={isProcessing || !inputValue || (inputMode === 'fiat' ? calculatedFiatAmount : calculatedCryptoAmount) <=0 }
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    