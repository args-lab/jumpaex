
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquare, X, AlertTriangle, Loader2, SwitchCamera } from 'lucide-react';
import type { Asset, MockSeller } from '@/types';
import { MOCK_CONVERSION_RATES, mockCurrencies } from '@/data/mock';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TradeProposalModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  asset: Asset;
  seller: MockSeller;
  assetSymbol: string;
  displayCurrencyId: string;
  locale: string | undefined;
}

// Helper to format fiat currency
const formatFiatDisplay = (value: number, currencyCode: string, locale: string | undefined): string => {
  const targetCurrencyInfo = mockCurrencies.find(c => c.id.toUpperCase() === currencyCode.toUpperCase());
  const displaySymbol = targetCurrencyInfo?.symbol || currencyCode.toUpperCase();
  
  let minFractionDigits = 2;
  let maxFractionDigits = 2;

  if (targetCurrencyInfo && targetCurrencyInfo.id.toUpperCase() !== 'USDT') {
      try {
          return value.toLocaleString(locale, { style: 'currency', currency: targetCurrencyInfo.id, minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits });
      } catch (e) {
          // Fallback for unknown currency codes
          return `${value.toLocaleString(locale, { minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits })} ${displaySymbol}`;
      }
  }
  // For USDT or fallback
  return `${value.toLocaleString(locale, { minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits })} ${displaySymbol}`;
};

// Helper to format crypto currency
const formatCryptoDisplay = (value: number, symbol: string, locale: string | undefined): string => {
  if (isNaN(value) || !isFinite(value)) return `0.00 ${symbol}`;
  // Determine precision based on value
  let precision = 6;
  if (Math.abs(value) > 0 && Math.abs(value) < 0.000001) precision = 8;
  else if (Math.abs(value) > 0 && Math.abs(value) < 0.01) precision = 6;
  else if (Math.abs(value) > 0 && Math.abs(value) < 1) precision = 4;
  else precision = 2;
  
  return `${value.toLocaleString(locale, { minimumFractionDigits: precision, maximumFractionDigits: 8 })} ${symbol}`;
};


export function TradeProposalModal({
  isOpen,
  onOpenChange,
  asset,
  seller,
  assetSymbol,
  displayCurrencyId,
  locale,
}: TradeProposalModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [inputMode, setInputMode] = useState<'crypto' | 'fiat'>('crypto');
  const [inputValue, setInputValue] = useState<string>(''); // Raw input from the text field

  const [calculatedCryptoAmount, setCalculatedCryptoAmount] = useState<number>(0);
  const [calculatedFiatAmountInDisplayCurrency, setCalculatedFiatAmountInDisplayCurrency] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState(false);

  const sellerAskingPriceUSD = seller.desiredPricePerAssetUSD !== undefined ? seller.desiredPricePerAssetUSD : asset.price;
  const displayCurrencyInfo = useMemo(() => mockCurrencies.find(c => c.id.toLowerCase() === displayCurrencyId.toLowerCase()), [displayCurrencyId]);
  const displayCurrencyName = displayCurrencyInfo?.name || displayCurrencyId.toUpperCase();
  const displayCurrencySymbol = displayCurrencyInfo?.symbol || displayCurrencyId.toUpperCase();

  const conversionRateToUSDFromDisplayCurrency = MOCK_CONVERSION_RATES[displayCurrencyId.toUpperCase()] || (displayCurrencyId.toUpperCase() === 'USD' ? 1 : 0);

  useEffect(() => {
    let currentCrypto = 0;
    let currentFiat = 0;
    const numericInputValue = parseFloat(inputValue) || 0;

    if (inputMode === 'crypto') {
      currentCrypto = numericInputValue;
      const costInUSD = currentCrypto * sellerAskingPriceUSD;
      if (displayCurrencyId.toLowerCase() === 'usd' || !conversionRateToUSDFromDisplayCurrency) {
        currentFiat = costInUSD;
      } else {
        currentFiat = costInUSD / conversionRateToUSDFromDisplayCurrency;
      }
    } else { // inputMode === 'fiat'
      currentFiat = numericInputValue;
      let fiatValueInUSD = currentFiat;
      if (displayCurrencyId.toLowerCase() !== 'usd' && conversionRateToUSDFromDisplayCurrency) {
        fiatValueInUSD = currentFiat * conversionRateToUSDFromDisplayCurrency;
      }
      if (sellerAskingPriceUSD > 0) {
        currentCrypto = fiatValueInUSD / sellerAskingPriceUSD;
      } else {
        currentCrypto = 0;
      }
    }
    setCalculatedCryptoAmount(currentCrypto);
    setCalculatedFiatAmountInDisplayCurrency(currentFiat);

  }, [inputValue, inputMode, sellerAskingPriceUSD, displayCurrencyId, conversionRateToUSDFromDisplayCurrency]);
  
  const handleStartChat = () => {
    if (calculatedCryptoAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: `Please enter a valid amount.`,
        variant: 'destructive',
      });
      return;
    }

    const tradeAmountInUSD = calculatedCryptoAmount * sellerAskingPriceUSD;

    if (tradeAmountInUSD < seller.minSellUSD) {
        toast({
            title: 'Amount Too Low',
            description: `The minimum trade amount is ${formatFiatDisplay(seller.minSellUSD, 'USD', locale)} (${formatCryptoDisplay(seller.minSellUSD / sellerAskingPriceUSD, assetSymbol, locale )}).`,
            variant: 'destructive',
        });
        return;
    }
    if (tradeAmountInUSD > seller.maxSellUSD) {
        toast({
            title: 'Amount Too High',
            description: `The maximum trade amount is ${formatFiatDisplay(seller.maxSellUSD, 'USD', locale)} (${formatCryptoDisplay(seller.maxSellUSD / sellerAskingPriceUSD, assetSymbol, locale)}).`,
            variant: 'destructive',
        });
        return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      router.push(`/chat/${asset.id}/${seller.id}?amount=${calculatedCryptoAmount}&assetSymbol=${assetSymbol}`);
      setIsProcessing(false);
      onOpenChange(false); 
    }, 750);
  };
  
  useEffect(() => {
    if (!isOpen) {
      setInputValue(''); 
      setInputMode('crypto'); // Reset mode
      setIsProcessing(false);
      setCalculatedCryptoAmount(0);
      setCalculatedFiatAmountInDisplayCurrency(0);
    }
  }, [isOpen]);

  const handleInputModeChange = (mode: 'crypto' | 'fiat') => {
    setInputMode(mode);
    // When switching mode, try to convert current value if possible, or clear
    if (mode === 'crypto') {
        setInputValue(isFinite(calculatedCryptoAmount) && calculatedCryptoAmount > 0 ? calculatedCryptoAmount.toString() : '');
    } else { // mode === 'fiat'
        setInputValue(isFinite(calculatedFiatAmountInDisplayCurrency) && calculatedFiatAmountInDisplayCurrency > 0 ? calculatedFiatAmountInDisplayCurrency.toString() : '');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Propose Trade with {seller.name}</DialogTitle>
          <DialogDescription>
            You are initiating a trade for <strong>{asset.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-3 border rounded-md bg-muted/30 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Seller's Asking Price:</span>
              <span className="font-medium">{formatFiatDisplay(sellerAskingPriceUSD, 'USD', locale)} / {assetSymbol}</span>
            </div>
             <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min Trade (USD):</span>
                <span>{formatFiatDisplay(seller.minSellUSD, 'USD', locale)}</span>
            </div>
             <div className="flex justify-between text-xs text-muted-foreground">
                <span>Max Trade (USD):</span>
                <span>{formatFiatDisplay(seller.maxSellUSD, 'USD', locale)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="input-mode" className="text-base">Enter amount in:</Label>
            <RadioGroup
                id="input-mode"
                value={inputMode}
                onValueChange={(value) => handleInputModeChange(value as 'crypto' | 'fiat')}
                className="flex space-x-4"
                disabled={isProcessing}
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="crypto" id="mode-crypto" />
                    <Label htmlFor="mode-crypto" className="font-normal cursor-pointer">{assetSymbol}</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fiat" id="mode-fiat" />
                    <Label htmlFor="mode-fiat" className="font-normal cursor-pointer">{displayCurrencyName}</Label>
                </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade-value-input" className="text-base">
              Amount to Trade:
            </Label>
            <Input
              id="trade-value-input"
              type="number"
              placeholder={inputMode === 'crypto' ? `e.g., 0.5 ${assetSymbol}` : `e.g., 100 ${displayCurrencySymbol}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="text-base"
              disabled={isProcessing}
            />
          </div>
          
          {parseFloat(inputValue) > 0 && (
            <div className="p-3 border rounded-md bg-card space-y-2 text-sm">
              {inputMode === 'crypto' && (
                <div>
                  <span className="text-muted-foreground">Estimated Cost: </span>
                  <span className="font-medium">{formatFiatDisplay(calculatedFiatAmountInDisplayCurrency, displayCurrencyId, locale)}</span>
                </div>
              )}
              {inputMode === 'fiat' && (
                <div>
                  <span className="text-muted-foreground">You will receive (approx.): </span>
                  <span className="font-medium">{formatCryptoDisplay(calculatedCryptoAmount, assetSymbol, locale)}</span>
                </div>
              )}
            </div>
          )}


          <Alert variant="default" className="mt-4">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle className="text-orange-600">Confirm Details</AlertTitle>
            <AlertDescription>
              Ensure the amount is correct. Starting a chat implies your intent to trade.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button 
            onClick={handleStartChat} 
            disabled={calculatedCryptoAmount <= 0 || isProcessing}
            className={cn("bg-accent hover:bg-accent/90 text-accent-foreground", isProcessing && "opacity-70")}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" /> Start Chat
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    