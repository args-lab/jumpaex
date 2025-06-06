
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<string>(mockRegions[0].id);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(mockCurrencies[0].id);
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>(mockBlockchainNetworks[0].id);
  const [selectedTradeType, setSelectedTradeType] = useState<string>('buy');
  
  const [showFilters, setShowFilters] = useState(true);

  const filteredAssets = useMemo(() => {
    if (selectedTradeType === 'sell') {
      // If user selects 'Sell', we assume they are looking to create a sell listing,
      // not browse existing ones. Current mockAssets are for buying.
      return [];
    }
    return mockAssets.filter(asset => {
      const regionMatch = selectedRegion === 'global' || asset.region === selectedRegion;
      const currencyMatch = asset.currency.toLowerCase() === selectedCurrency.toLowerCase() || (asset.currency === "USDT" && (selectedCurrency === "usd" || selectedCurrency === "usdt"));
      const blockchainMatch = selectedBlockchain === 'all' || asset.network.toLowerCase() === selectedBlockchain.toLowerCase();
      return regionMatch && currencyMatch && blockchainMatch;
    });
  }, [selectedRegion, selectedCurrency, selectedBlockchain, selectedTradeType]);

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
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden"> {/* Changed from md:hidden to lg:hidden */}
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> {/* Adjusted grid classes */}
              <div>
                <Label htmlFor="trade-type-group" className="text-sm font-medium mb-2 block">Trade Type</Label>
                <RadioGroup
                  id="trade-type-group"
                  onValueChange={setSelectedTradeType}
                  value={selectedTradeType}
                  className="flex space-x-2 pt-2" 
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="buy" id="r_buy" />
                    <Label htmlFor="r_buy" className="font-normal cursor-pointer">Buy</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="sell" id="r_sell" />
                    <Label htmlFor="r_sell" className="font-normal cursor-pointer">Sell</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="region-selector" className="text-sm font-medium mb-2 block">Region</Label>
                <RegionSelector
                  id="region-selector"
                  regions={mockRegions}
                  selectedRegion={selectedRegion}
                  onRegionChange={setSelectedRegion}
                />
              </div>

              <div>
                <Label htmlFor="currency-selector" className="text-sm font-medium mb-2 block">Currency</Label>
                <CurrencySelector
                  id="currency-selector"
                  currencies={mockCurrencies}
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                />
              </div>

              <div>
                <Label htmlFor="blockchain-filter" className="text-sm font-medium mb-2 block">Blockchain</Label>
                <BlockchainFilter
                  id="blockchain-filter"
                  networks={mockBlockchainNetworks}
                  selectedNetwork={selectedBlockchain}
                  onNetworkChange={setSelectedBlockchain}
                />
              </div>
            </div>
          )}
        </div>
        
        <Separator className="my-8" />

        <AssetList 
          assets={filteredAssets} 
          blockchainNetworks={mockBlockchainNetworks} 
        />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} AnonTrade. All rights reserved.
      </footer>
      <BottomNavigationBar />
    </div>
  );
}
