
'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Timer, X } from 'lucide-react';

interface AssetInfo {
  symbol: string;
  icon: React.ReactNode;
  amount: string;
  valueUSD?: string;
}

interface ConfirmConvertSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fromAsset: AssetInfo;
  toAsset: AssetInfo;
  rate: string;
  fees: string;
  onConfirm: () => Promise<void>; // Make onConfirm async
  isLoading: boolean;
}

const COUNTDOWN_SECONDS = 5;

export function ConfirmConvertSheet({
  isOpen,
  onOpenChange,
  fromAsset,
  toAsset,
  rate,
  fees,
  onConfirm,
  isLoading,
}: ConfirmConvertSheetProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(COUNTDOWN_SECONDS); // Reset countdown when sheet is closed
      return;
    }

    if (countdown === 0) return;

    const timerId = setInterval(() => {
      setCountdown(prevCountdown => prevCountdown - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isOpen, countdown]);

  const handleConfirm = async () => {
    if (isLoading) return;
    await onConfirm();
    // isLoading state change and closing the sheet will be handled by the parent
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle className="font-headline text-lg">Confirm Order</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <div className="p-4 space-y-4 text-sm">
          {/* From Asset */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">From</span>
            <div className="flex items-center font-medium">
              {fromAsset.icon}
              <span className="ml-2 mr-1">{fromAsset.symbol}</span>
              <span>{fromAsset.amount}</span>
            </div>
          </div>

          {/* To Asset */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">To</span>
            <div className="text-right">
                <div className="flex items-center font-medium justify-end">
                    {toAsset.icon}
                    <span className="ml-2 mr-1">{toAsset.symbol}</span>
                    <span>{toAsset.amount}</span>
                </div>
                {toAsset.valueUSD && (
                    <span className="text-xs text-muted-foreground">{toAsset.valueUSD}</span>
                )}
            </div>
          </div>
          
          <Separator />

          {/* Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">Instant</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Fees</span>
              <span className="font-medium">{fees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">{rate}</span>
            </div>
          </div>
        </div>
        <SheetFooter className="p-4 border-t">
          <Button
            className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground text-base"
            onClick={handleConfirm}
            disabled={isLoading || countdown > 0}
          >
            {isLoading ? (
              'Processing...'
            ) : countdown > 0 ? (
              <>
                <Timer className="mr-2 h-4 w-4" /> Confirm ({countdown}s)
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
