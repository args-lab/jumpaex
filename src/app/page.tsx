
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
import { mockMarketAssets, formatMarketPrice } from '@/data/mock';
import type { MarketAsset } from '@/types';
import { Gift, PiggyBank, Users, Trophy, LayoutGrid, ChevronDown, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';


const iconMenuItems = [
  { label: 'Rewards Hub', icon: Gift, href: '#' },
  { label: 'Earn', icon: PiggyBank, href: '#' },
  { label: 'Referral', icon: Users, href: '#' },
  { label: 'Traders League', icon: Trophy, href: '#' },
  { label: 'More', icon: LayoutGrid, href: '#' },
];

const mainMarketTabs = [
  { value: 'favorites', label: 'Favorites' },
  { value: 'hot', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'gainers', label: 'Gainers' },
  { value: 'losers', label: 'Losers' },
  { value: 'vol24h', label: '24h Vol' },
  { value: 'marketcap', label: 'Market Cap' },
];

const subMarketTabs = [
  { value: 'all', label: 'All' },
  { value: 'blockchain_l1_l2', label: 'Blockchain L1/L2' },
  { value: 'stablecoin', label: 'Stablecoin' },
  { value: 'new_coin', label: 'New Coin' },
];

export default function HomePage() {
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isActualDepositCryptoModalOpen, setIsActualDepositCryptoModalOpen] = useState(false);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState('favorites');
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(navigator.language);
    }
    // Mock balance initialization
    const balance = 0.26212233; // As per image
    setTotalBalanceUSD(balance.toLocaleString(navigator.language || undefined, { // Added undefined fallback for navigator.language
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    }));
  }, []);

  // Filter assets based on tabs (mock implementation)
  const displayedMarketAssets = useMemo(() => {
    // In a real app, filtering would happen here based on activeMainTab and activeSubTab
    return mockMarketAssets;
  }, [activeMainTab, activeSubTab]);

  const handleOpenActualDepositModal = () => {
    setIsAddFundsModalOpen(false); // Close the AddFundsModal
    setIsActualDepositCryptoModalOpen(true); // Open the actual DepositCryptoModal
  };

  // Placeholder navigation/action handlers for options other than P2P
  const handleNavigateToBuyWithFiat = () => {
    toast({ title: 'Navigate', description: 'Redirecting to Buy with Fiat page (mock)...' });
    setIsAddFundsModalOpen(false);
  };
  const handleNavigateToReceive = () => {
    toast({ title: 'Navigate', description: 'Redirecting to Receive via Pay page (mock)...' });
    setIsAddFundsModalOpen(false);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto px-4 pt-6 pb-20">
        {/* Top Section: Balance and Add Funds */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-xs text-muted-foreground flex items-center">
              Total Balance (USD) <ChevronDown className="h-3 w-3 ml-0.5" />
            </div>
            <div className="text-3xl font-bold">
              ${totalBalanceUSD !== null ? totalBalanceUSD : '0.00000000'}
            </div>
          </div>
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground h-9 px-4 text-sm"
            onClick={() => setIsAddFundsModalOpen(true)}
          >
            Add Funds
          </Button>
        </div>

        {/* Icon Grid Menu */}
        <div className="grid grid-cols-5 gap-2 mb-8 text-center">
          {iconMenuItems.map((item) => (
            <a key={item.label} href={item.href} className="flex flex-col items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center h-10 w-10 mb-1.5 bg-muted/70 rounded-lg">
                <item.icon className="h-5 w-5 text-foreground/80" />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Market Tabs */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="mb-1">
          <div className="flex justify-between items-center">
            <TabsList className="bg-transparent p-0 h-auto space-x-3 overflow-x-auto no-scrollbar">
              {mainMarketTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-foreground pb-2 px-1 data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none",
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground ml-2 shrink-0">
                <Menu className="h-5 w-5"/>
            </Button>
          </div>
        </Tabs>

        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="mb-4">
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
        </Tabs>


        {/* Asset List Table */}
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
