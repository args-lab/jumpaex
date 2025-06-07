
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, HelpCircle, Info, RefreshCcw } from 'lucide-react';
import type { DepositableAsset } from '@/types';
import { depositableAssets as allDepositableAssets, MOCK_CONVERSION_RATES as mockAssetPairRates, getAssetPriceInUSD } from '@/data/mock';
import { useToast } from '@/hooks/use-toast';
import { ConfirmConvertSheet } from '@/components/app/confirm-convert-sheet';

const MOCK_BALANCES: Record<string, number> = {
  USDT: 1500.75,
  BTC: 0.05,
  ETH: 0.00006193, // Matches image
  BNB: 10,
  SOL: 100,
  MOVE: 5, // Example balance for MOVE
};

// Specific conversion rates for pairs, e.g., 1 FROM_ASSET = X TO_ASSET
const MOCK_CONVERSION_RATES_PAIRS: Record<string, Record<string, number>> = {
  USDT: { BNB: 1 / 580, BTC: 1 / 60000, ETH: 1 / 3000, SOL: 1 / 150, USDT: 1, MOVE: 1 / 0.15 },
  BNB: { USDT: 580, BTC: 580 / 60000, ETH: 580 / 3000, SOL: 580 / 150, BNB: 1, MOVE: 580 / 0.15 },
  BTC: { USDT: 60000, BNB: 60000 / 580, ETH: 60000 / 3000, SOL: 60000 / 150, BTC: 1, MOVE: 60000 / 0.15 },
  ETH: { USDT: 3000, BNB: 3000 / 580, BTC: 3000 / 60000, SOL: 3000 / 150, ETH: 1, MOVE: 1 / 0.0000570903 }, // Matches image rate for MOVE per ETH
  SOL: { USDT: 150, BNB: 150 / 580, BTC: 150 / 60000, ETH: 150 / 3000, SOL: 1, MOVE: 150 / 0.15 },
  MOVE: { USDT: 0.15, ETH: 0.0000570903, BNB: 0.15 / 580, BTC: 0.15/60000, SOL: 0.15/150, MOVE: 1},
};


const MOCK_LIMITS: Record<string, { min: number; max: number }> = {
    USDT: { min: 0.01, max: 4500000 },
    BNB: { min: 0.000015, max: 7200 },
    BTC: { min: 0.00001, max: 10 },
    ETH: { min: 0.00000001, max: 100 }, // Lowered min for ETH to match image
    SOL: { min: 0.01, max: 1000 },
    MOVE: { min: 0.1, max: 100000 }, // Example limits for MOVE
};

export const getAssetIconNode = (symbol: string): React.ReactNode => {
    const asset = allDepositableAssets.find(a => a.symbol.toUpperCase() === symbol.toUpperCase());
    if (asset?.icon) {
        if (typeof asset.icon === 'string') {
            return <Image src={asset.icon} alt={symbol} width={20} height={20} className="rounded-full" data-ai-hint={`${asset.name} logo`} />;
        }
        const IconComponent = asset.icon;
        return <IconComponent className="h-5 w-5" />;
    }
    return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
};


export default function ConvertPage() {
  const [fromAssetSymbol, setFromAssetSymbol] = useState<string>('ETH'); // Default to ETH to match image
  const [toAssetSymbol, setToAssetSymbol] = useState<string>('MOVE');   // Default to MOVE to match image
  const [fromAmount, setFromAmount] = useState<string>('0.00006193'); // Default fromAmount to match image
  const [toAmount, setToAmount] = useState<string>('');
  const { toast } = useToast();
  const [isConfirmSheetOpen, setIsConfirmSheetOpen] = useState(false);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const [currentRateString, setCurrentRateString] = useState<string>('');

  const availableFromBalance = MOCK_BALANCES[fromAssetSymbol] || 0;
  const fromLimits = MOCK_LIMITS[fromAssetSymbol] || { min: 0, max: Infinity };
  const toLimits = MOCK_LIMITS[toAssetSymbol] || { min: 0, max: Infinity };


  useEffect(() => {
    let rate = 0;
    if (MOCK_CONVERSION_RATES_PAIRS[fromAssetSymbol]?.[toAssetSymbol]) {
      rate = MOCK_CONVERSION_RATES_PAIRS[fromAssetSymbol][toAssetSymbol];
      setCurrentRateString(`1 ${fromAssetSymbol} = ${rate.toLocaleString(undefined, {maximumFractionDigits: 10})} ${toAssetSymbol}`);
    } else {
      setCurrentRateString('Rate unavailable');
    }

    if (fromAmount && parseFloat(fromAmount) > 0 && rate > 0) {
      const converted = parseFloat(fromAmount) * rate;
      let precision = (toAssetSymbol === 'BTC' || (converted > 0 && converted < 0.000001)) ? 8 : 
                      (converted > 0 && converted < 0.001) ? 6 : 4;
      if (toAssetSymbol === 'USDT' || toAssetSymbol === 'MOVE') precision = 8; // Match image for MOVE
      
      setToAmount(converted.toFixed(precision));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromAssetSymbol, toAssetSymbol]);

  const handleSwapAssets = () => {
    const tempAsset = fromAssetSymbol;
    setFromAssetSymbol(toAssetSymbol);
    setToAssetSymbol(tempAsset);
    setFromAmount(toAmount); // Swap amounts as well
  };

  const handleMaxAmount = () => {
    setFromAmount(availableFromBalance.toString());
  };

  const handlePreviewConversion = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount to convert.", variant: "destructive" });
      return;
    }
    if (parseFloat(fromAmount) < fromLimits.min) {
        toast({ title: "Error", description: `Minimum amount for ${fromAssetSymbol} is ${fromLimits.min}.`, variant: "destructive"});
        return;
    }
    if (parseFloat(fromAmount) > fromLimits.max) {
        toast({ title: "Error", description: `Maximum amount for ${fromAssetSymbol} is ${fromLimits.max}.`, variant: "destructive"});
        return;
    }
    setIsConfirmSheetOpen(true);
  };

  const handleConfirmConversion = async () => {
    setIsSheetLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Conversion Successful (Mock)',
      description: `Converted ${fromAmount} ${fromAssetSymbol} to approx. ${toAmount} ${toAssetSymbol}.`,
    });
    setIsSheetLoading(false);
    setIsConfirmSheetOpen(false);
    setFromAmount(''); // Clear amounts after successful conversion
  }
  
  const selectableAssets = allDepositableAssets.filter(asset => MOCK_BALANCES[asset.symbol] !== undefined && MOCK_LIMITS[asset.symbol] !== undefined);

  const toAmountUSDValue = useMemo(() => {
    if (!toAmount || !toAssetSymbol) return 0;
    const numericToAmount = parseFloat(toAmount);
    return numericToAmount * getAssetPriceInUSD(toAssetSymbol);
  }, [toAmount, toAssetSymbol]);

  const sheetRateString = useMemo(() => {
    const rate = MOCK_CONVERSION_RATES_PAIRS[fromAssetSymbol]?.[toAssetSymbol];
    if (rate) {
        // As per image: 1 ETH = 17,523.3 MOVE, and 1 MOVE = 0.00005701 ETH
        // The main display rate is 1 FromAsset = X ToAsset
        // The sheet rate shows both: 1 ToAsset = Y FromAsset AND 1 FromAsset = X ToAsset
        // For the sheet "Rate" field, it seems to show "1 FROM_ASSET = X TO_ASSET" like the image "1 ETH = 17,523.3 MOVE"
        return `1 ${fromAssetSymbol} = ${rate.toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits: 8})} ${toAssetSymbol}`;
    }
    return 'N/A';
  }, [fromAssetSymbol, toAssetSymbol]);


  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24">
        <h1 className="text-2xl sm:text-3xl font-headline font-bold mb-1 text-center">Convert</h1>
        {currentRateString !== 'Rate unavailable' && (
             <div className="text-center text-xs text-muted-foreground mb-1">
                {`1 ${toAssetSymbol} = ${(1 / (MOCK_CONVERSION_RATES_PAIRS[fromAssetSymbol]?.[toAssetSymbol] || 1)).toLocaleString(undefined, {maximumFractionDigits: 10})} ${fromAssetSymbol}`}
                {/* Example dynamic change based on mock data, not real */}
                <span className="text-green-500 ml-1"> +4.80%</span> 
            </div>
        )}
        <div className="text-center text-xs text-muted-foreground mb-6">
            <Button variant="link" size="sm" className="p-0 h-auto text-xs">Instant</Button>
            <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground/70 text-xs mx-2">Recurring</Button>
            <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground/70 text-xs">Limit</Button>
        </div>


        <div className="max-w-md mx-auto space-y-0 relative">
          {/* From Card */}
          <Card className="rounded-b-none shadow-lg">
            <CardContent className="p-4 space-y-3">
              <Label htmlFor="from-asset-select" className="text-xs text-muted-foreground">From</Label>
              <div className="flex items-center justify-between">
                <Select value={fromAssetSymbol} onValueChange={setFromAssetSymbol}>
                  <SelectTrigger id="from-asset-select" className="w-auto h-9 border-none shadow-none !px-0 text-xl font-medium focus:ring-0">
                    <div className="flex items-center">
                      {getAssetIconNode(fromAssetSymbol)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {selectableAssets.map(asset => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center gap-2">
                          {getAssetIconNode(asset.symbol)}
                          {asset.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-right h-auto py-0 border-none shadow-none text-xl font-medium focus-visible:ring-0 focus-visible:ring-offset-0 max-w-[200px] bg-transparent"
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="text-muted-foreground flex items-center">
                  Available: {availableFromBalance.toLocaleString(undefined, {maximumFractionDigits: 8})} {fromAssetSymbol}
                  <Info className="h-3 w-3 ml-1 text-muted-foreground/70" />
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto text-primary text-xs" onClick={handleMaxAmount}>Max</Button>
              </div>
               <p className="text-xs text-muted-foreground text-right h-4">
                {fromLimits.min.toLocaleString(undefined, {maximumFractionDigits: 8})} - {fromLimits.max.toLocaleString(undefined, {maximumFractionDigits: 2})}
               </p>
            </CardContent>
          </Card>

          {/* Swap Button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 my-[-2px]">
            <Button variant="outline" size="icon" onClick={handleSwapAssets} className="rounded-md bg-card h-8 w-8 border-border shadow-md hover:bg-muted">
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {/* To Card */}
          <Card className="rounded-t-none shadow-lg">
            <CardContent className="p-4 space-y-3">
              <Label htmlFor="to-asset-select" className="text-xs text-muted-foreground">To</Label>
               <div className="flex items-center justify-between">
                <Select value={toAssetSymbol} onValueChange={setToAssetSymbol}>
                  <SelectTrigger id="to-asset-select" className="w-auto h-9 border-none shadow-none !px-0 text-xl font-medium focus:ring-0">
                     <div className="flex items-center">
                       {getAssetIconNode(toAssetSymbol)}
                       <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                     {selectableAssets.map(asset => (
                      <SelectItem key={asset.symbol} value={asset.symbol} disabled={asset.symbol === fromAssetSymbol}>
                         <div className="flex items-center gap-2">
                           {getAssetIconNode(asset.symbol)}
                           {asset.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="text-right h-auto py-0 border-none shadow-none text-xl font-medium focus-visible:ring-0 focus-visible:ring-offset-0 max-w-[200px] bg-transparent"
                />
              </div>
              <p className="text-xs text-muted-foreground text-right h-4">
                {/* Display rate like "1 MOVE = 0.0000570903 ETH" */}
                { MOCK_CONVERSION_RATES_PAIRS[toAssetSymbol]?.[fromAssetSymbol] && 
                    `1 ${toAssetSymbol} = ${(MOCK_CONVERSION_RATES_PAIRS[toAssetSymbol]?.[fromAssetSymbol] || 0).toLocaleString(undefined, {maximumFractionDigits: 10})} ${fromAssetSymbol}`
                }
              </p>
              <p className="text-xs text-muted-foreground text-right h-4">
                 {toLimits.min.toLocaleString(undefined, {maximumFractionDigits: 8})} - {toLimits.max.toLocaleString(undefined, {maximumFractionDigits: 2})}
              </p>
            </CardContent>
          </Card>
          <Button
            size="lg"
            className="w-full mt-8 h-12 text-base bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handlePreviewConversion}
            disabled={!fromAmount || parseFloat(fromAmount) <= 0 || !toAmount || parseFloat(toAmount) <= 0}
          >
            Convert
          </Button>
        </div>
      </main>
      <BottomNavigationBar />
      <ConfirmConvertSheet
        isOpen={isConfirmSheetOpen}
        onOpenChange={setIsConfirmSheetOpen}
        fromAsset={{
            symbol: fromAssetSymbol,
            icon: getAssetIconNode(fromAssetSymbol),
            amount: parseFloat(fromAmount || "0").toLocaleString(undefined, {maximumFractionDigits: 8})
        }}
        toAsset={{
            symbol: toAssetSymbol,
            icon: getAssetIconNode(toAssetSymbol),
            amount: parseFloat(toAmount || "0").toLocaleString(undefined, {maximumFractionDigits: 8}),
            valueUSD: toAmountUSDValue > 0 ? `≈ $${toAmountUSDValue.toFixed(2)}` : undefined
        }}
        rate={sheetRateString}
        fees={`0 ${toAssetSymbol}`} // Mock fee
        onConfirm={handleConfirmConversion}
        isLoading={isSheetLoading}
      />
    </div>
  );
}
