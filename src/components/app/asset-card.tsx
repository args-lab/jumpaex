
'use client';

import { useState, useEffect } from 'react';
import type { Asset, BlockchainNetwork } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Network } from 'lucide-react'; // Changed MessageSquare to Users
import Image from 'next/image';

interface AssetCardProps {
  asset: Asset;
  onFindSellerClick: (asset: Asset) => void; // Renamed prop
  blockchainNetworks: BlockchainNetwork[];
}

const getMinMaxDigits = (price: number, currency: string) => {
  const upperCurrency = currency.toUpperCase();
  return (upperCurrency === 'USDT' || upperCurrency === 'USD') ? 2 : (price < 1 ? 6 : 2);
};

const calculateFormattedPrice = (price: number, currency: string, locale: string | undefined) => {
  const upperCurrency = currency.toUpperCase();
  const minMaxDigits = getMinMaxDigits(price, currency);

  if (upperCurrency === 'USDT') {
    return `${price.toLocaleString(locale, {
      minimumFractionDigits: minMaxDigits,
      maximumFractionDigits: minMaxDigits,
    })} ${upperCurrency}`;
  } else {
    try {
      return price.toLocaleString(locale, {
        style: 'currency',
        currency: upperCurrency,
        minimumFractionDigits: minMaxDigits,
        maximumFractionDigits: minMaxDigits,
      });
    } catch (e) {
      return `${price.toLocaleString(locale, {
        minimumFractionDigits: minMaxDigits,
        maximumFractionDigits: minMaxDigits,
      })} ${upperCurrency}`;
    }
  }
};

export function AssetCard({ asset, onFindSellerClick, blockchainNetworks }: AssetCardProps) {
  const [displayedPrice, setDisplayedPrice] = useState<string | null>(null);
  const [displayedVolume, setDisplayedVolume] = useState<string | null>(null);

  useEffect(() => {
    setDisplayedPrice(calculateFormattedPrice(asset.price, asset.currency, undefined));
    setDisplayedVolume(asset.volume.toLocaleString(undefined));
  }, [asset.price, asset.currency, asset.volume]);

  const networkInfo = blockchainNetworks.find(n => n.id === asset.network);
  const AssetIcon = asset.icon && typeof asset.icon !== 'string' ? asset.icon : null;
  const NetworkIcon = networkInfo?.icon && typeof networkInfo.icon !== 'string' ? networkInfo.icon : Network;

  const ssrFormattedPrice = `${asset.price.toFixed(getMinMaxDigits(asset.price, asset.currency))} ${asset.currency.toUpperCase()}`;
  const ssrFormattedVolume = asset.volume.toString();

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {AssetIcon ? (
              <AssetIcon className="h-10 w-10 text-primary" />
            ) : typeof asset.icon === 'string' ? (
              <Image src={asset.icon} alt={asset.name} width={40} height={40} className="rounded-full" data-ai-hint={`${asset.name} logo`} />
            ) : (
              <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary font-bold text-lg">
                {asset.name.substring(0, 1)}
              </div>
            )}
            <div>
              <CardTitle className="text-xl font-headline">{asset.name}</CardTitle>
              <CardDescription className="text-sm">Listed by: {asset.seller}</CardDescription>
            </div>
          </div>
          <Badge variant={asset.change24h >= 0 ? "default" : "destructive"} className="bg-opacity-20 text-opacity-100 border-opacity-50">
            {asset.change24h >= 0 ? (
              <TrendingUp className="mr-1 h-4 w-4" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4" />
            )}
            {asset.change24h.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold text-primary">
            {displayedPrice !== null ? displayedPrice : ssrFormattedPrice}
          </span>
          <span className="text-sm text-muted-foreground">/ {asset.name.split(" ")[0]}</span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Volume: {displayedVolume !== null ? displayedVolume : ssrFormattedVolume} {asset.name.split(" ")[0]}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <NetworkIcon className="mr-2 h-4 w-4 text-primary" />
          Network: {networkInfo?.name || asset.network}
        </div>
        <div className="text-sm text-muted-foreground">
          Region: <span className="capitalize">{asset.region.replace('_', ' ')}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/20">
        <Button onClick={() => onFindSellerClick(asset)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Users className="mr-2 h-4 w-4" />
          Find Seller
        </Button>
      </CardFooter>
    </Card>
  );
}
