'use client';

import type * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Currency } from '@/types';
import { Landmark } from 'lucide-react';

interface CurrencySelectorProps {
  currencies: Currency[];
  selectedCurrency: string;
  onCurrencyChange: (currencyId: string) => void;
  className?: string;
}

export function CurrencySelector({
  currencies,
  selectedCurrency,
  onCurrencyChange,
  className,
}: CurrencySelectorProps) {
  return (
    <div className={className}>
      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger className="w-full md:w-[180px]">
           <div className="flex items-center">
            <Landmark className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select Currency" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.id} value={currency.id}>
              {currency.name} ({currency.symbol})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
