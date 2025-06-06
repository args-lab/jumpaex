
'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/app/header';
import { RegionSelector } from '@/components/app/region-selector';
import { CurrencySelector } from '@/components/app/currency-selector';
import { BlockchainFilter } from '@/components/app/blockchain-filter';
import { AssetList } from '@/components/app/asset-list';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import type { Asset } from '@/types';
import { mockAssets, mockRegions, mockCurrencies, mockBlockchainNetworks } from '@/data/mock';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<string>(mockRegions[0].id);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(mockCurrencies[0].id);
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>(mockBlockchainNetworks[0].id);
  
  const [showFilters, setShowFilters] = useState(true);

  const filteredAssets = useMemo(() => {
    return mockAssets.filter(asset => {
      const regionMatch = selectedRegion === 'global' || asset.region === selectedRegion;
      const currencyMatch = asset.currency.toLowerCase() === selectedCurrency.toLowerCase() || (asset.currency === "USDT" && (selectedCurrency === "usd" || selectedCurrency === "usdt"));
      const blockchainMatch = selectedBlockchain === 'all' || asset.network.toLowerCase() === selectedBlockchain.toLowerCase();
      return regionMatch && currencyMatch && blockchainMatch;
    });
  }, [selectedRegion, selectedCurrency, selectedBlockchain]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-20">
        <div className="mb-6">
          <h1 className="text-3xl font-headline font-bold mb-2">P2P Crypto Marketplace</h1>
          <p className="text-muted-foreground">Find the best crypto deals in your region.</p>
        </div>

        <div className="mb-8 p-4 sm:p-6 bg-card rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-headline font-semibold mb-2 sm:mb-0">Filters</h2>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="sm:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <RegionSelector
                regions={mockRegions}
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
              />
              <CurrencySelector
                currencies={mockCurrencies}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
              <BlockchainFilter
                networks={mockBlockchainNetworks}
                selectedNetwork={selectedBlockchain}
                onNetworkChange={setSelectedBlockchain}
              />
            </div>
          )}
        </div>
        
        <Separator className="my-8" />

        <AssetList 
          assets={filteredAssets} 
          blockchainNetworks={mockBlockchainNetworks} 
        />
      </main>
      {/* FindSellerModal is removed as it's replaced by a page */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} AnonTrade. All rights reserved.
      </footer>
      <BottomNavigationBar />
    </div>
  );
}
