
import type { Asset, BlockchainNetwork } from '@/types';
import { AssetCard } from './asset-card';

interface AssetListProps {
  assets: Asset[];
  blockchainNetworks: BlockchainNetwork[];
  selectedDisplayCurrency: string; // Added to pass to AssetCard
}

export function AssetList({ assets, blockchainNetworks, selectedDisplayCurrency }: AssetListProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-xl">No assets found matching your criteria.</p>
        <p>Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {assets.map((asset) => (
        <AssetCard 
            key={asset.id} 
            asset={asset} 
            blockchainNetworks={blockchainNetworks} 
            selectedDisplayCurrency={selectedDisplayCurrency}
        />
      ))}
    </div>
  );
}
