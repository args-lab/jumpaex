
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
import { ArrowRightLeft, HelpCircle, Info } from 'lucide-react';
import type { DepositableAsset } from '@/types';
import { depositableAssets as allDepositableAssets } from '@/data/mock';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MOCK_BALANCES: Record<string, number> = {
  USDT: 1500.75,
  BTC: 0.05,
  ETH: 2.5,
  BNB: 10,
  SOL: 100,
};

const MOCK_CONVERSION_RATES: Record<string, Record<string, number>> = {
  USDT: { BNB: 1 / 580, BTC: 1 / 60000, ETH: 1 / 3000, SOL: 1 / 150, USDT: 1 },
  BNB: { USDT: 580, BTC: 580 / 60000, ETH: 580 / 3000, SOL: 580 / 150, BNB: 1 },
  BTC: { USDT: 60000, BNB: 60000 / 580, ETH: 60000 / 3000, SOL: 60000 / 150, BTC: 1 },
  ETH: { USDT: 3000, BNB: 3000 / 580, BTC: 3000 / 60000, SOL: 3000 / 150, ETH: 1 },
  SOL: { USDT: 150, BNB: 150 / 580, BTC: 150 / 60000, ETH: 150 / 3000, SOL: 1 },
};

const MOCK_LIMITS: Record<string, { min: number; max: number }> = {
    USDT: { min: 0.01, max: 4500000 },
    BNB: { min: 0.000015, max: 7200 },
    BTC: { min: 0.00001, max: 10 },
    ETH: { min: 0.0001, max: 100 },
    SOL: { min: 0.01, max: 1000 },
};

const getAssetIcon = (symbol: string): React.ReactNode => {
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
  const [fromAssetSymbol, setFromAssetSymbol] = useState<string>('USDT');
  const [toAssetSymbol, setToAssetSymbol] = useState<string>('BNB');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const { toast } = useToast();

  const availableFromBalance = MOCK_BALANCES[fromAssetSymbol] || 0;
  const fromLimits = MOCK_LIMITS[fromAssetSymbol] || { min: 0, max: 0 };
  const toLimits = MOCK_LIMITS[toAssetSymbol] || { min: 0, max: 0 };


  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0 && MOCK_CONVERSION_RATES[fromAssetSymbol]?.[toAssetSymbol]) {
      const rate = MOCK_CONVERSION_RATES[fromAssetSymbol][toAssetSymbol];
      const converted = parseFloat(fromAmount) * rate;
      // Determine precision based on the 'to' asset.
      let precision = (toAssetSymbol === 'BTC' || (converted > 0 && converted < 0.000001)) ? 8 : 
                      (converted > 0 && converted < 0.01) ? 6 : 4;
      if (toAssetSymbol === 'USDT') precision = 2;
      
      setToAmount(converted.toFixed(precision));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromAssetSymbol, toAssetSymbol]);

  const handleSwapAssets = () => {
    const tempAsset = fromAssetSymbol;
    setFromAssetSymbol(toAssetSymbol);
    setToAssetSymbol(tempAsset);
    // Optionally swap amounts or clear them
    const tempAmount = fromAmount;
    setFromAmount(toAmount); // this might not be what user expects, but for now
    // setToAmount(tempAmount); // if toAmount was an input
  };

  const handleMaxAmount = () => {
    setFromAmount(availableFromBalance.toString());
  };

  const handleConvert = () => { // Renamed from handlePreview
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
    toast({
      title: 'Conversion Submitted (Mock)', // Updated toast message
      description: `Converting ${fromAmount} ${fromAssetSymbol} to approx. ${toAmount} ${toAssetSymbol}.`,
    });
  };
  
  const selectableAssets = allDepositableAssets.filter(asset => MOCK_BALANCES[asset.symbol] !== undefined && MOCK_LIMITS[asset.symbol] !== undefined);

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24">
        <h1 className="text-2xl sm:text-3xl font-headline font-bold mb-6 text-center">Convert</h1>

        <div className="max-w-md mx-auto space-y-0 relative">
          {/* From Card */}
          <Card className="rounded-b-none shadow-lg">
            <CardContent className="p-4 space-y-3">
              <Label htmlFor="from-asset-select" className="text-xs text-muted-foreground">From</Label>
              <div className="flex items-center justify-between">
                <Select value={fromAssetSymbol} onValueChange={setFromAssetSymbol}>
                  <SelectTrigger id="from-asset-select" className="w-auto h-9 border-none shadow-none !px-0 text-base font-medium focus:ring-0">
                    <div className="flex items-center">
                      {getAssetIcon(fromAssetSymbol)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {selectableAssets.map(asset => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center gap-2">
                          {getAssetIcon(asset.symbol)}
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
                  className="text-right h-9 border-none shadow-none text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0 max-w-[150px]"
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="text-muted-foreground flex items-center">
                  Available: {availableFromBalance.toLocaleString(undefined, {maximumFractionDigits: 6})} {fromAssetSymbol}
                  <Info className="h-3 w-3 ml-1 text-muted-foreground/70" />
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto text-primary text-xs" onClick={handleMaxAmount}>Max</Button>
              </div>
               <p className="text-xs text-muted-foreground text-right">{fromLimits.min.toLocaleString(undefined, {maximumFractionDigits: 8})} - {fromLimits.max.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </CardContent>
          </Card>

          {/* Swap Button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 my-[-2px]">
            <Button variant="outline" size="icon" onClick={handleSwapAssets} className="rounded-md bg-card h-8 w-8 border-border shadow-md hover:bg-muted">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {/* To Card */}
          <Card className="rounded-t-none shadow-lg">
            <CardContent className="p-4 space-y-3">
              <Label htmlFor="to-asset-select" className="text-xs text-muted-foreground">To</Label>
               <div className="flex items-center justify-between">
                <Select value={toAssetSymbol} onValueChange={setToAssetSymbol}>
                  <SelectTrigger id="to-asset-select" className="w-auto h-9 border-none shadow-none !px-0 text-base font-medium focus:ring-0">
                     <div className="flex items-center">
                       {getAssetIcon(toAssetSymbol)}
                       <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                     {selectableAssets.map(asset => (
                      <SelectItem key={asset.symbol} value={asset.symbol} disabled={asset.symbol === fromAssetSymbol}>
                         <div className="flex items-center gap-2">
                           {getAssetIcon(asset.symbol)}
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
                  className="text-right h-9 border-none shadow-none text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0 max-w-[150px] bg-transparent"
                />
              </div>
              <p className="text-xs text-muted-foreground text-right h-4">{/* Placeholder for spacing, or show toBalance here if needed */}</p>
              <p className="text-xs text-muted-foreground text-right">{toLimits.min.toLocaleString(undefined, {maximumFractionDigits: 8})} - {toLimits.max.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </CardContent>
          </Card>
        </div>

        <Button
          size="lg"
          className="w-full max-w-md mx-auto mt-8 h-12 text-base bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={handleConvert} // Renamed handler
          disabled={!fromAmount || parseFloat(fromAmount) <= 0 || !toAmount || parseFloat(toAmount) <= 0}
        >
          Convert {/* Updated Label */}
        </Button>

      </main>
      <BottomNavigationBar />
    </div>
  );
}

    