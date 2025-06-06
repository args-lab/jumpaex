
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
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
import type { Transaction as TransactionType } from '@/types';
import { mockTransactions } from '@/data/mock';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { format as formatDateFns } from 'date-fns';

// Helper to determine decimal places
const getMinMaxDigits = (value: number, currency: string) => {
  const upperCurrency = currency.toUpperCase();
  return (upperCurrency === 'USDT' || upperCurrency === 'USD') ? 2 : (value < 1 ? 6 : 2);
};

// Helper function to format price client-side
const calculateFormattedCurrency = (value: number, currency: string, locale: string | undefined) => {
  const upperCurrency = currency.toUpperCase();
  const minMaxDigits = getMinMaxDigits(value, currency);

  if (upperCurrency === 'USDT') {
    return `${value.toLocaleString(locale, {
      minimumFractionDigits: minMaxDigits,
      maximumFractionDigits: minMaxDigits,
    })} ${upperCurrency}`;
  } else {
    try {
      return value.toLocaleString(locale, {
        style: 'currency',
        currency: upperCurrency,
        minimumFractionDigits: minMaxDigits,
        maximumFractionDigits: minMaxDigits,
      });
    } catch (e) {
      // Fallback for any other currency codes that might not be ISO-compliant
      return `${value.toLocaleString(locale, {
        minimumFractionDigits: minMaxDigits,
        maximumFractionDigits: minMaxDigits,
      })} ${upperCurrency}`;
    }
  }
};

interface FormattedTransaction extends TransactionType {
  displayPrice: string;
  displayTotal: string;
  displayDate: string;
  displayAmount: string;
}

export default function TransactionsPage() {
  const [formattedTransactions, setFormattedTransactions] = useState<FormattedTransaction[]>([]);

  useEffect(() => {
    const locale = undefined; // browser default
    setFormattedTransactions(
      mockTransactions.map(tx => ({
        ...tx,
        displayPrice: calculateFormattedCurrency(tx.price, tx.currency, locale),
        displayTotal: calculateFormattedCurrency(tx.total, tx.currency, locale),
        displayDate: formatDateFns(new Date(tx.date), 'PPp'),
        displayAmount: tx.amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 8 }),
      }))
    );
  }, []);

  // Use formattedTransactions if available (client-side), otherwise use mockTransactions with SSR-safe formatting
  const transactionsToDisplay = formattedTransactions.length > 0
    ? formattedTransactions
    : mockTransactions.map(tx => ({
        ...tx,
        displayPrice: `${tx.price.toFixed(getMinMaxDigits(tx.price, tx.currency))} ${tx.currency.toUpperCase()}`,
        displayTotal: `${tx.total.toFixed(getMinMaxDigits(tx.total, tx.currency))} ${tx.currency.toUpperCase()}`,
        displayDate: formatDateFns(new Date(tx.date), 'yyyy-MM-dd HH:mm'), // Basic, non-locale specific format for SSR
        displayAmount: parseFloat(tx.amount.toFixed(8)).toString(), // SSR-safe amount formatting
  }));


  const getStatusVariant = (status: TransactionType['status']) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Pending': return 'secondary';
      case 'Failed': return 'destructive';
      case 'Cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeAttributes = (type: TransactionType['type']) => {
    if (type === 'Buy') {
      return { Icon: ArrowDownLeft, color: 'text-green-500' }; // Using direct color for semantic meaning
    }
    return { Icon: ArrowUpRight, color: 'text-red-500' }; // Using direct color for semantic meaning
  };

  const getAssetDisplay = (assetIcon: TransactionType['assetIcon'], assetName: string) => {
    const AssetIconComponent = assetIcon && typeof assetIcon !== 'string' ? assetIcon : null;
    if (AssetIconComponent) {
      return <AssetIconComponent className="h-6 w-6 mr-2 shrink-0" />;
    }
    if (typeof assetIcon === 'string') {
      return <Image src={assetIcon} alt={assetName} width={24} height={24} className="rounded-full mr-2 shrink-0" data-ai-hint={`${assetName} logo`} />;
    }
    return <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center text-primary font-bold text-xs mr-2 shrink-0">{assetName.substring(0, 1)}</div>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 pt-8 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold mb-2">Trade Transaction History</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Review your past P2P trades.</p>
        </div>

        <div className="rounded-lg border shadow-sm bg-card overflow-x-auto">
          <Table>
            {transactionsToDisplay.length === 0 && mockTransactions.length === 0 && (
               <TableCaption>No transactions yet. Your completed trades will appear here.</TableCaption>
            )}
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px] whitespace-nowrap">Asset</TableHead>
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                <TableHead className="text-right whitespace-nowrap">Price</TableHead>
                <TableHead className="text-right whitespace-nowrap">Total</TableHead>
                <TableHead className="min-w-[150px] whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Counterparty</TableHead>
                <TableHead className="text-center whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsToDisplay.map((tx) => {
                const { Icon: TypeIcon, color: typeColor } = getTypeAttributes(tx.type);
                return (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getAssetDisplay(tx.assetIcon, tx.assetName)}
                        <span className="font-medium truncate">{tx.assetName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center ${typeColor}`}>
                        <TypeIcon className="mr-1 h-4 w-4 shrink-0" />
                        {tx.type}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{tx.displayAmount}</TableCell>
                    <TableCell className="text-right font-mono">{tx.displayPrice}</TableCell>
                    <TableCell className="text-right font-mono">{tx.displayTotal}</TableCell>
                    <TableCell className="font-mono text-xs">{tx.displayDate}</TableCell>
                    <TableCell className="truncate">{tx.counterparty}</TableCell>
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
           {/* Loading state indication if mockTransactions has items but formattedTransactions is not yet populated */}
           {mockTransactions.length > 0 && formattedTransactions.length === 0 && (
             <div className="text-center py-10 text-muted-foreground">
                <p className="text-lg">Loading transactions...</p>
             </div>
           )}
        </div>
      </main>
      <BottomNavigationBar />
    </div>
  );
}

