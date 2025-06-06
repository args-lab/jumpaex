
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { WalletTransaction as WalletTransactionType } from '@/types';
import { mockWalletTransactions } from '@/data/mock';
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle, Clock, XCircle, AlertCircle, DollarSign, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { format as formatDateFns } from 'date-fns';

// Helper to determine decimal places for wallet transactions
const getWalletAmountMinMaxDigits = (amount: number, assetSymbol: string) => {
  const fiatSymbols = ['USD', 'EUR', 'GBP', 'JPY']; 
  if (fiatSymbols.includes(assetSymbol.toUpperCase())) {
    return 2;
  }
  return amount < 0.000001 ? 8 : (amount < 1 ? 6 : 4);
};

// Helper function to format amount client-side
const formatWalletAmount = (amount: number, assetSymbol: string, locale: string | undefined) => {
  const minMaxDigits = getWalletAmountMinMaxDigits(amount, assetSymbol);
  const formattedAmount = amount.toLocaleString(locale, {
    minimumFractionDigits: minMaxDigits,
    maximumFractionDigits: minMaxDigits,
  });
  return `${formattedAmount} ${assetSymbol.toUpperCase()}`;
};

interface FormattedWalletTransaction extends WalletTransactionType {
  displayAmount: string;
  displayDate: string;
}

export default function WalletPage() {
  const [formattedWalletTransactions, setFormattedWalletTransactions] = useState<FormattedWalletTransaction[]>([]);

  useEffect(() => {
    const locale = undefined; // browser default
    setFormattedWalletTransactions(
      mockWalletTransactions.map(tx => ({
        ...tx,
        displayAmount: formatWalletAmount(tx.amount, tx.assetSymbol, locale),
        displayDate: formatDateFns(new Date(tx.date), 'PPp'),
      }))
    );
  }, []);

  const transactionsToDisplay = formattedWalletTransactions.length > 0
    ? formattedWalletTransactions
    : mockWalletTransactions.map(tx => {
        // tx.date is an ISO string like "2024-06-07T12:30:00.000Z"
        // For SSR and initial client render, create a consistent UTC-based string.
        // Example: "2024-06-07 12:30"
        const ssrDisplayDate = tx.date.substring(0, 10) + ' ' + tx.date.substring(11, 16);
        
        return {
          ...tx,
          displayAmount: `${tx.amount.toFixed(getWalletAmountMinMaxDigits(tx.amount, tx.assetSymbol))} ${tx.assetSymbol.toUpperCase()}`,
          displayDate: ssrDisplayDate,
        };
      });

  const getStatusVariant = (status: WalletTransactionType['status']) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Pending': return 'secondary';
      case 'Failed': return 'destructive';
      case 'Cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeAttributes = (type: WalletTransactionType['type']) => {
    if (type === 'Deposit') {
      return { Icon: ArrowDownToLine, color: 'text-green-500', label: 'Deposit' };
    }
    return { Icon: ArrowUpFromLine, color: 'text-red-500', label: 'Withdrawal' };
  };
  
  const getAssetDisplay = (assetIcon: WalletTransactionType['assetIcon'], assetName: string, assetSymbol: string) => {
    const AssetIconComponent = assetIcon && typeof assetIcon !== 'string' ? assetIcon : null;
    if (AssetIconComponent) {
      return <AssetIconComponent className="h-6 w-6 mr-2 shrink-0" />;
    }
    if (typeof assetIcon === 'string') {
      return <Image src={assetIcon} alt={assetName} width={24} height={24} className="rounded-full mr-2 shrink-0" data-ai-hint={`${assetName} logo`} />;
    }
    if (['USD', 'EUR', 'GBP', 'JPY'].includes(assetSymbol.toUpperCase()) ) {
        return <DollarSign className="h-6 w-6 mr-2 shrink-0 text-muted-foreground" />;
    }
    return <HelpCircle className="h-6 w-6 mr-2 shrink-0 text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 pt-8 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold mb-2">Manage Your Funds</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Deposit or withdraw assets, and view your wallet history.</p>
        </div>

        <div className="mb-8 p-4 sm:p-6 bg-card rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 font-headline">Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <ArrowDownToLine className="mr-2 h-5 w-5" /> Deposit Funds
            </Button>
            <Button variant="destructive" size="lg" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              <ArrowUpFromLine className="mr-2 h-5 w-5" /> Withdraw Funds
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        <div>
          <h2 className="text-xl sm:text-2xl font-headline font-semibold mb-4">Wallet History</h2>
          <div className="rounded-lg border shadow-sm bg-card overflow-x-auto">
            <Table>
              {transactionsToDisplay.length === 0 && mockWalletTransactions.length === 0 && (
                <TableCaption>No wallet transactions yet. Your activity will appear here.</TableCaption>
              )}
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Type</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Asset</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Transaction ID / Network</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsToDisplay.map((tx) => {
                  const { Icon: TypeIcon, color: typeColor, label: typeLabel } = getTypeAttributes(tx.type);
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">{tx.displayDate}</TableCell>
                      <TableCell>
                        <div className={`flex items-center ${typeColor}`}>
                          <TypeIcon className="mr-1 h-4 w-4 shrink-0" />
                          {typeLabel}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                           {getAssetDisplay(tx.assetIcon, tx.assetName, tx.assetSymbol)}
                          <span className="font-medium truncate">{tx.assetName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{tx.displayAmount}</TableCell>
                      <TableCell className="text-xs truncate">
                        {tx.transactionId || 'N/A'}
                        {tx.network && <div className="text-muted-foreground text-[10px] uppercase">{tx.network}</div>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(tx.status)} className="capitalize whitespace-nowrap">
                          {tx.status === 'Completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {tx.status === 'Pending' && <Clock className="mr-1 h-3 w-3" />}
                          {tx.status === 'Failed' && <XCircle className="mr-1 h-3 w-3" />}
                          {tx.status === 'Cancelled' && <AlertCircle className="mr-1 h-3 w-3" />}
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {mockWalletTransactions.length > 0 && formattedWalletTransactions.length === 0 && (
               <div className="text-center py-10 text-muted-foreground">
                  <p className="text-lg">Loading wallet history...</p>
               </div>
             )}
          </div>
        </div>
      </main>
      <BottomNavigationBar />
    </div>
  );
}
