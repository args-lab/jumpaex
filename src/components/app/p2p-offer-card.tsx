
'use client';

import type { P2POffer } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ShieldCheck, Clock, ThumbsUp } from 'lucide-react';

interface P2POfferCardProps {
  offer: P2POffer;
  locale: string | undefined;
  tradeType: 'buy' | 'sell';
  onInitiateTrade: (offer: P2POffer) => void; // New prop
}

const formatFiat = (value: number, currencySymbol: string, locale: string | undefined, fractionDigits = 0) => {
  return `${currencySymbol}${value.toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
};

const formatNumber = (value: number, locale: string | undefined, fractionDigits = 2) => {
  return value.toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
};

export function P2POfferCard({ offer, locale, tradeType, onInitiateTrade }: P2POfferCardProps) {
  const fiatSymbol = offer.fiatCurrency === 'IDR' ? 'Rp ' : (offer.fiatCurrency === 'USD' ? '$' : `${offer.fiatCurrency} `);

  return (
    <Card className="overflow-hidden shadow-sm border border-border hover:border-primary/50 transition-colors duration-200">
      <CardHeader className="p-3 pb-2 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-7 w-7 text-xs">
              <AvatarFallback className="bg-muted text-muted-foreground">
                {offer.sellerAvatarInitial}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{offer.sellerName}</span>
            {offer.isSellerVerified && (
              <ShieldCheck className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          <span>{offer.tradeCount} Trades ({formatNumber(offer.completionRate, locale)}%)</span>
          {offer.positiveFeedbackRate && (
            <span className="ml-2">
              <ThumbsUp className="inline h-3 w-3 mr-0.5" />
              {formatNumber(offer.positiveFeedbackRate, locale)}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 grid grid-cols-3 gap-3 items-start">
        <div className="col-span-2 space-y-1">
          <div>
            <span className="text-lg font-bold">
              {formatFiat(offer.pricePerCrypto, fiatSymbol, locale, offer.fiatCurrency === 'IDR' ? 0 : 2)}
            </span>
            <span className="text-xs text-muted-foreground">/{offer.cryptoAssetSymbol}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Limit: {formatFiat(offer.minLimitFiat, fiatSymbol, locale)} - {formatFiat(offer.maxLimitFiat, fiatSymbol, locale)}
          </div>
          <div className="text-xs text-muted-foreground">
            Available: {formatNumber(offer.availableCrypto, locale)} {offer.cryptoAssetSymbol}
          </div>
          {offer.tags?.includes('Verification') && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 mt-1 border-yellow-500 text-yellow-600">
              Verification
            </Badge>
          )}
        </div>
        <div className="col-span-1 flex flex-col items-end justify-between h-full">
          <div className="text-right space-y-0.5">
            {offer.paymentMethods.slice(0, 2).map(pm => ( // Show max 2 payment methods initially
              <div key={pm} className="text-xs text-muted-foreground truncate">{pm}</div>
            ))}
            {offer.paymentMethods.length > 2 && (
                <div className="text-xs text-muted-foreground">+{offer.paymentMethods.length - 2} more</div>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3 mr-1" /> {offer.avgCompletionTimeMinutes} min
          </div>
          <Button 
            size="sm" 
            className="mt-2 w-full h-8 text-xs bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => onInitiateTrade(offer)}
          >
            {tradeType === 'buy' ? 'Buy' : 'Sell'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
