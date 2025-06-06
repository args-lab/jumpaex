
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
import { MessageSquare, ArrowRight, X, AlertTriangle, Loader2, Tag, ShoppingCart } from 'lucide-react';
import type { Asset, MockSeller, Currency } from '@/types';
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

// Helper from find-seller page, could be centralized
const formatConvertedDisplayPrice = (value: number, currencyCode: string, locale: string | undefined) => {
    const targetCurrencyInfo = mockCurrencies.find(c => c.id.toUpperCase() === currencyCode.toUpperCase());
    const displaySymbol = targetCurrencyInfo?.symbol || currencyCode.toUpperCase();
    
    let minFractionDigits = 2;
    let maxFractionDigits = 2;

    if (targetCurrencyInfo && targetCurrencyInfo.id.toUpperCase() !== 'USDT') {
         try {
            return value.toLocaleString(locale, { style: 'currency', currency: targetCurrencyInfo.id, minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits });
        } catch (e) {
            return `${value.toLocaleString(locale, { minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits })} ${displaySymbol}`;
        }
    }
    return `${value.toLocaleString(locale, { minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxFractionDigits })} ${displaySymbol}`;
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
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const numericTradeAmount = useMemo(() => parseFloat(tradeAmount) || 0, [tradeAmount]);

  const sellerAskingPriceUSD = seller.desiredPricePerAssetUSD !== undefined ? seller.desiredPricePerAssetUSD : asset.price; // Fallback to asset market price if seller specific not set

  const estimatedCostUSD = useMemo(() => {
    return numericTradeAmount * sellerAskingPriceUSD;
  }, [numericTradeAmount, sellerAskingPriceUSD]);

  const estimatedCostDisplayCurrency = useMemo(() => {
    if (displayCurrencyId.toLowerCase() === 'usd') {
      return null; // Already showing USD
    }
    const targetRateToUSD = MOCK_CONVERSION_RATES[displayCurrencyId.toUpperCase()] || 0;
    if (targetRateToUSD > 0) {
      return estimatedCostUSD / targetRateToUSD;
    }
    return null;
  }, [estimatedCostUSD, displayCurrencyId]);


  const handleStartChat = () => {
    if (numericTradeAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: `Please enter a valid amount of ${assetSymbol} to trade.`,
        variant: 'destructive',
      });
      return;
    }

    // Check against seller's min/max if values are available in USD
    // Convert tradeAmount to its USD value using seller's asking price for comparison
    const tradeAmountInUSD = numericTradeAmount * sellerAskingPriceUSD;

    if (tradeAmountInUSD < seller.minSellUSD) {
        toast({
            title: 'Amount Too Low',
            description: `The minimum trade amount is ${formatConvertedDisplayPrice(seller.minSellUSD, 'USD', locale)} (${(seller.minSellUSD / sellerAskingPriceUSD).toFixed(6)} ${assetSymbol}).`,
            variant: 'destructive',
        });
        return;
    }
    if (tradeAmountInUSD > seller.maxSellUSD) {
        toast({
            title: 'Amount Too High',
            description: `The maximum trade amount is ${formatConvertedDisplayPrice(seller.maxSellUSD, 'USD', locale)} (${(seller.maxSellUSD / sellerAskingPriceUSD).toFixed(6)} ${assetSymbol}).`,
            variant: 'destructive',
        });
        return;
    }

    setIsProcessing(true);
    // Simulate a small delay then navigate
    setTimeout(() => {
      router.push(`/chat/${asset.id}/${seller.id}?amount=${numericTradeAmount}&assetSymbol=${assetSymbol}`);
      setIsProcessing(false);
      onOpenChange(false); // Close modal on success
    }, 750);
  };
  
  useEffect(() => {
    if (!isOpen) {
      setTradeAmount(''); // Reset amount when modal is closed/reopened
      setIsProcessing(false);
    }
  }, [isOpen]);

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
              <span className="font-medium">{formatConvertedDisplayPrice(sellerAskingPriceUSD, 'USD', locale)} / {assetSymbol}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min Trade (USD):</span>
                <span>{formatConvertedDisplayPrice(seller.minSellUSD, 'USD', locale)}</span>
            </div>
             <div className="flex justify-between text-xs text-muted-foreground">
                <span>Max Trade (USD):</span>
                <span>{formatConvertedDisplayPrice(seller.maxSellUSD, 'USD', locale)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade-amount" className="text-base">
              Amount of {assetSymbol} to Trade:
            </Label>
            <Input
              id="trade-amount"
              type="number"
              placeholder={`e.g., 0.5`}
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              className="text-base"
              disabled={isProcessing}
            />
          </div>

          {numericTradeAmount > 0 && (
            <div className="p-3 border rounded-md bg-card space-y-2">
              <h4 className="font-medium text-md">Estimated Cost:</h4>
              <div className="flex justify-between text-lg font-semibold text-primary">
                <span>USD:</span>
                <span>{formatConvertedDisplayPrice(estimatedCostUSD, 'USD', locale)}</span>
              </div>
              {estimatedCostDisplayCurrency !== null && displayCurrencyId.toLowerCase() !== 'usd' && (
                <div className="flex justify-between text-md text-muted-foreground">
                  <span>{displayCurrencyId.toUpperCase()}:</span>
                  <span>{formatConvertedDisplayPrice(estimatedCostDisplayCurrency, displayCurrencyId, locale)}</span>
                </div>
              )}
            </div>
          )}

          <Alert variant="default" className="mt-4">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle className="text-orange-600">Confirm Details</AlertTitle>
            <AlertDescription>
              Ensure the amount is correct. Starting a chat implies your intent to trade this amount.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button 
            onClick={handleStartChat} 
            disabled={numericTradeAmount <= 0 || isProcessing}
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
