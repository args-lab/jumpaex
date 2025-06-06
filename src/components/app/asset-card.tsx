
import type { Asset, BlockchainNetwork } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, MessageSquare, Network } from 'lucide-react';
import Image from 'next/image'; // Assuming next/image for potential future image URLs

interface AssetCardProps {
  asset: Asset;
  onChatClick: (asset: Asset) => void;
  blockchainNetworks: BlockchainNetwork[];
}

export function AssetCard({ asset, onChatClick, blockchainNetworks }: AssetCardProps) {
  const networkInfo = blockchainNetworks.find(n => n.id === asset.network);
  const AssetIcon = asset.icon && typeof asset.icon !== 'string' ? asset.icon : null;
  const NetworkIcon = networkInfo?.icon && typeof networkInfo.icon !== 'string' ? networkInfo.icon : Network;

  const formatPrice = (price: number, currency: string) => {
    const upperCurrency = currency.toUpperCase();
    // Determine decimal places based on original logic
    const minMaxDigits = (upperCurrency === 'USDT' || upperCurrency === 'USD') ? 2 : (price < 1 ? 6 : 2);

    if (upperCurrency === 'USDT') {
      // For USDT, format as a number and append the currency code string
      return `${price.toLocaleString(undefined, { 
        minimumFractionDigits: minMaxDigits, 
        maximumFractionDigits: minMaxDigits 
      })} ${upperCurrency}`;
    } else {
      // For other (presumably standard ISO) currencies
      try {
        return price.toLocaleString(undefined, {
          style: 'currency',
          currency: upperCurrency, // Use upperCurrency for safety, though toLocaleString might be tolerant
          minimumFractionDigits: minMaxDigits,
          maximumFractionDigits: minMaxDigits,
        });
      } catch (e) {
        // Fallback for any other currency codes that might not be ISO-compliant
        // or if any other error occurs during formatting.
        // This will format it as a number and append the currency string, similar to USDT.
        return `${price.toLocaleString(undefined, { 
          minimumFractionDigits: minMaxDigits, 
          maximumFractionDigits: minMaxDigits 
        })} ${upperCurrency}`;
      }
    }
  };

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {AssetIcon ? (
              <AssetIcon className="h-10 w-10 text-primary" />
            ) : typeof asset.icon === 'string' ? (
              <Image src={asset.icon} alt={asset.name} width={40} height={40} className="rounded-full" data-ai-hint={`${asset.name} logo`}/>
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
            {formatPrice(asset.price, asset.currency)}
          </span>
          <span className="text-sm text-muted-foreground">/ {asset.name.split(" ")[0]}</span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Volume: {asset.volume.toLocaleString()} {asset.name.split(" ")[0]}
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
        <Button onClick={() => onChatClick(asset)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat with Seller
        </Button>
      </CardFooter>
    </Card>
  );
}
