'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AddFundsModal } from '@/components/app/add-funds-modal';
import { DepositModal } from '@/components/app/deposit-modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatMarketPrice, MOCK_CONVERSION_RATES } from '@/data/mock'; // Added MOCK_CONVERSION_RATES
import type { MarketAsset } from '@/types';
import { getPairsWithPrices } from '@/types/market_data_feed'; // Added
import { ChevronDown, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';


const iconMenuItems = [
  { label: 'Deposit', icon: ArrowDownToLine, href: '#' }, 
  { label: 'Withdraw', icon: ArrowUpFromLine, href: '#' }, 
  { label: 'Transfer', icon: ArrowRightLeft, href: '#' },
];

const subMarketTabs = [
  { value: 'all', label: 'All' },
  { value: 'blockchain_l1_l2', label: 'Blockchain L1/L2' },
  { value: 'stablecoin', label: 'Stablecoin' },
  { value: 'new_coin', label: 'New Coin' },
];

const L1_L2_ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'DOT', 'AVAX', 'MATIC', 'XRP', 'DOGE', 'SHIB', 'LINK', 'TRX', 'ICP', 'ETC', 'XLM', 'NEAR', 'ATOM', 'ALGO', 'FTM'];
const STABLECOINS = ['USDT', 'USDC', 'DAI', 'IDRT', 'BIDR']; // Common stablecoins, IDRT/BIDR for Indodax

export default function HomePage() {
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isActualDepositCryptoModalOpen, setIsActualDepositCryptoModalOpen] = useState(false);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const [indodaxMarketData, setIndodaxMarketData] = useState<MarketAsset[]>([]); // Added

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(navigator.language);
    }
    // Mock balance initialization
    const balance = 0.26212233; // As per image
    setTotalBalanceUSD(balance.toLocaleString(navigator.language || undefined, { 
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawPairs = await getPairsWithPrices();
        if (!rawPairs || rawPairs.length === 0) {
          console.warn("Failed to fetch Indodax data or no pairs returned.");
          setIndodaxMarketData([]);
          return;
        }

        const usdRateForQuoteAsset: { [assetSymbol: string]: number } = {
          'USDT': 1,
          'IDR': MOCK_CONVERSION_RATES.IDR || (1 / 16200), // Using a common rate for IDR
        };

        // First pass: get USD prices for common quote currencies like BTC, ETH from their USDT/IDR pairs
        rawPairs.forEach(pair => {
          const base = pair.base_currency.toUpperCase();
          const tickerId = pair.ticker_id.toLowerCase();
          const parts = tickerId.split('_');
          if (parts.length !== 2) return;

          const currentPairBase = parts[0].toUpperCase();
          const currentPairQuote = parts[1].toUpperCase();
          
          // Ensure the base_currency from the pair matches the base part of ticker_id for safety
          if (currentPairBase !== base && !tickerId.startsWith(base.toLowerCase()+'_')) return;


          if (pair.last) {
            if (currentPairQuote === 'USDT') {
              usdRateForQuoteAsset[base] = parseFloat(pair.last);
            } else if (currentPairQuote === 'IDR') {
              usdRateForQuoteAsset[base] = parseFloat(pair.last) * usdRateForQuoteAsset['IDR'];
            }
          }
        });
        
        const transformedData: MarketAsset[] = rawPairs.map(pair => {
          const baseAsset = pair.base_currency.toUpperCase();
          const tickerIdLower = pair.ticker_id.toLowerCase();
          const baseCurrencyLower = pair.base_currency.toLowerCase();
          let quoteAsset = '';

          if (tickerIdLower.startsWith(baseCurrencyLower + '_')) {
            quoteAsset = tickerIdLower.substring(baseCurrencyLower.length + 1).toUpperCase();
          } else {
            const parts = tickerIdLower.split('_');
            if (parts.length > 1) {
              quoteAsset = parts[parts.length - 1].toUpperCase();
            } else {
              console.warn(`Cannot determine quote asset for ticker_id: ${pair.ticker_id}, base: ${baseAsset}`);
              return null; 
            }
          }
          if (!quoteAsset) return null;

          const lastPrice = parseFloat(pair.last || '0');
          let lastPriceUSD = 0;

          if (quoteAsset === 'USDT') {
            lastPriceUSD = lastPrice;
          } else if (quoteAsset === 'IDR') {
            lastPriceUSD = lastPrice * (MOCK_CONVERSION_RATES.IDR || (1 / 16200));
          } else {
            const priceOfQuoteInUSD = usdRateForQuoteAsset[quoteAsset];
            if (priceOfQuoteInUSD !== undefined) {
              lastPriceUSD = lastPrice * priceOfQuoteInUSD;
            } else {
              // Default to 0 if no direct conversion path found for the quote asset
              lastPriceUSD = 0;
            }
          }
          
          return {
            id: pair.ticker_id,
            pair: `${baseAsset}/${quoteAsset}`,
            baseAsset,
            quoteAsset,
            lastPrice,
            lastPriceUSD,
            change24h: 0, // Not available from this Indodax endpoint combination
          };
        }).filter(asset => asset !== null) as MarketAsset[];

        setIndodaxMarketData(transformedData);
      } catch (error) {
        console.error("Error fetching or transforming Indodax market data:", error);
        setIndodaxMarketData([]);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(intervalId);
  }, []);


  const displayedMarketAssets = useMemo(() => {
    const baseFiltered = indodaxMarketData.filter(
      asset => asset.quoteAsset === 'IDR' || asset.quoteAsset === 'USDT'
    );

    switch (activeSubTab) {
      case 'all':
        return baseFiltered;
      case 'blockchain_l1_l2':
        return baseFiltered.filter(asset => L1_L2_ASSETS.includes(asset.baseAsset));
      case 'stablecoin':
        return baseFiltered.filter(asset => STABLECOINS.includes(asset.baseAsset));
      case 'new_coin':
        // For "New Coin", as API doesn't provide this, we can show a slice or all.
        // Or sort by a proxy if available (e.g. recently added if we had that info)
        // For now, showing all IDR/USDT pairs like 'all' or a limited number.
        return baseFiltered.slice(0, 20); // Example: show top 20 by default order
      default:
        return baseFiltered;
    }
  }, [indodaxMarketData, activeSubTab]);

  const handleOpenActualDepositModal = () => {
    setIsAddFundsModalOpen(false); 
    setIsActualDepositCryptoModalOpen(true); 
  };

  const handleNavigateToBuyWithFiat = () => {
    toast({ title: 'Navigate', description: 'Redirecting to Buy with Fiat page (mock)...' });
    setIsAddFundsModalOpen(false);
  };
  const handleNavigateToReceive = () => {
    toast({ title: 'Navigate', description: 'Redirecting to Receive via Pay page (mock)...' });
    setIsAddFundsModalOpen(false);
  };

  const handleDepositClick = () => {
    setIsAddFundsModalOpen(true); // Open the main AddFundsModal
  };

  const handleWithdrawClick = () => {
    toast({ title: 'Navigate', description: 'Withdraw functionality (mock)...' });
  };
  
  const handleTransferClick = () => {
     toast({ title: 'Navigate', description: 'Transfer functionality (mock)...' });
  };

  const iconMenuActions: Record<string, () => void> = {
    'Deposit': handleDepositClick,
    'Withdraw': handleWithdrawClick,
    'Transfer': handleTransferClick,
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto px-4 pt-6 pb-20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-xs text-muted-foreground flex items-center">
              Total Balance (USD) <ChevronDown className="h-3 w-3 ml-0.5" />
            </div>
            <div className="text-3xl font-bold">
              ${totalBalanceUSD !== null ? totalBalanceUSD : '0.00000000'}
            </div>
          </div>
          {/* <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground h-9 px-4 text-sm"
            onClick={() => setIsAddFundsModalOpen(true)} // This button also opens AddFundsModal
          >
            Add Funds
          </Button> */}
        </div>

        <div className={cn(
            "grid gap-2 mb-8 text-center",
            iconMenuItems.length === 3 ? "grid-cols-3" : 
            iconMenuItems.length === 4 ? "grid-cols-4" :
            "grid-cols-5" 
        )}>
          {iconMenuItems.map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              onClick={(e) => {
                if (iconMenuActions[item.label]) {
                  e.preventDefault(); 
                  iconMenuActions[item.label]();
                }
              }}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center h-10 w-10 mb-1.5 bg-muted/70 rounded-lg">
                <item.icon className="h-5 w-5 text-foreground/80" />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </a>
          ))}
        </div>

        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="mb-4">
          <div className="flex justify-between items-center">
            <TabsList className="bg-transparent p-0 h-auto space-x-3 overflow-x-auto no-scrollbar">
              {subMarketTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "text-xs text-muted-foreground hover:text-foreground px-2 py-1 h-7 rounded-md data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none",
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>


        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-0">
                <TableHead className="text-xs text-muted-foreground font-normal px-2 py-1 h-auto">Name</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground font-normal px-2 py-1 h-auto">Last Price</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground font-normal px-2 py-1 h-auto">24h chg%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedMarketAssets.map((asset) => {
                const { mainPriceFormatted, usdPriceFormatted } = formatMarketPrice(asset.lastPrice, asset.quoteAsset, asset.lastPriceUSD, locale);
                return (
                  <TableRow key={asset.id} className="border-b-0 hover:bg-muted/30">
                    <TableCell className="font-medium px-2 py-3 align-top">
                      <span className="font-bold text-sm">{asset.baseAsset}</span>
                      <span className="text-xs text-muted-foreground">/{asset.quoteAsset}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono px-2 py-3 align-top">
                      <div className="text-sm font-semibold">{mainPriceFormatted}</div>
                      <div className="text-xs text-muted-foreground">${usdPriceFormatted}</div>
                    </TableCell>
                    <TableCell className="text-right px-2 py-3 align-top">
                      <Badge
                        variant={asset.change24h >= 0 ? 'default' : 'destructive'}
                        className={cn(
                          "h-7 text-sm font-medium w-[70px] justify-center",
                          asset.change24h >= 0 ? 'bg-green-500/20 text-green-700 border-transparent hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 border-transparent hover:bg-red-500/30'
                        )}
                      >
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
             {displayedMarketAssets.length === 0 && (
                <TableCaption>No market assets to display for the selected filters.</TableCaption>
            )}
          </Table>
        </div>
      </main>
      <AddFundsModal
        isOpen={isAddFundsModalOpen}
        onOpenChange={setIsAddFundsModalOpen}
        onNavigateToBuyWithFiat={handleNavigateToBuyWithFiat}
        onNavigateToReceive={handleNavigateToReceive}
        onOpenDepositCryptoModal={handleOpenActualDepositModal}
      />
      <DepositModal isOpen={isActualDepositCryptoModalOpen} onOpenChange={setIsActualDepositCryptoModalOpen} />
      <BottomNavigationBar />
    </div>
  );
}
