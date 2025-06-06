
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserCircle, DollarSign, MessageSquare, Settings, ShieldCheck, Info, LogOut, ExternalLink } from 'lucide-react';
import { mockWalletTransactions, mockAssets } from '@/data/mock';
import type { WalletTransaction } from '@/types';

// Mock conversion rates (can be fetched from an API in a real app)
const MOCK_CONVERSION_RATES: Record<string, number> = {
  USD: 1,
  USDT: 1, // Assuming 1 USDT = 1 USD for simplicity
  EUR: 1.08, // Example: 1 EUR = 1.08 USD
  GBP: 1.25, // Example: 1 GBP = 1.25 USD
  // Add other fiat currencies if needed
};

const getAssetPriceInUSD = (assetSymbol: string): number => {
  const upperSymbol = assetSymbol.toUpperCase();
  if (MOCK_CONVERSION_RATES[upperSymbol]) {
    return MOCK_CONVERSION_RATES[upperSymbol];
  }
  const assetInfo = mockAssets.find(a => a.name.toUpperCase().startsWith(upperSymbol) || a.name.toUpperCase() === upperSymbol);
  if (assetInfo) {
    // If asset price is in USDT, assume 1 USDT = 1 USD
    // If asset price is already in USD, use it directly
    return assetInfo.currency.toUpperCase() === 'USDT' ? assetInfo.price * MOCK_CONVERSION_RATES['USDT'] : assetInfo.price;
  }
  return 0; // Or handle as unknown asset
};

export default function AccountPage() {
  const [totalPortfolioValueUSD, setTotalPortfolioValueUSD] = useState<number | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState<boolean>(true);

  useEffect(() => {
    setIsLoadingPortfolio(true);
    let totalValue = 0;
    const assetBalances: Record<string, number> = {};

    // Calculate balances from transactions
    mockWalletTransactions.forEach(tx => {
      if (tx.status === 'Completed') {
        const currentBalance = assetBalances[tx.assetSymbol.toUpperCase()] || 0;
        if (tx.type === 'Deposit') {
          assetBalances[tx.assetSymbol.toUpperCase()] = currentBalance + tx.amount;
        } else if (tx.type === 'Withdrawal') {
          assetBalances[tx.assetSymbol.toUpperCase()] = currentBalance - tx.amount;
        }
      }
    });
    
    // Calculate total portfolio value
    Object.keys(assetBalances).forEach(symbol => {
      const balance = assetBalances[symbol];
      if (balance > 0) {
        const priceInUSD = getAssetPriceInUSD(symbol);
        totalValue += balance * priceInUSD;
      }
    });

    setTotalPortfolioValueUSD(totalValue);
    setIsLoadingPortfolio(false);
  }, []);

  const mockUser = {
    username: 'AnonTraderX',
    email: 'anon.trader.x.long.email.address.to.test.wrapping@example.com',
    joinDate: 'January 15, 2024',
    avatarUrl: 'https://placehold.co/100x100.png',
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 pt-8 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your profile, settings, and view your portfolio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center space-x-4 pb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mockUser.avatarUrl} alt={mockUser.username} data-ai-hint="profile avatar" />
                <AvatarFallback>
                  <UserCircle className="h-10 w-10 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="font-headline text-xl">{mockUser.username}</CardTitle>
                <CardDescription className="break-words">{mockUser.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Joined:</strong> {mockUser.joinDate}</p>
              <Button variant="outline" size="sm" className="w-full">Edit Profile</Button>
            </CardContent>
          </Card>

          {/* Portfolio Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center">
                <DollarSign className="mr-2 h-6 w-6 text-primary" />
                My Portfolio
              </CardTitle>
              <CardDescription>Estimated total value of your funds.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPortfolio ? (
                <div className="h-12 flex items-center justify-center text-muted-foreground">Calculating...</div>
              ) : (
                <p className="text-3xl font-bold text-primary">
                  {totalPortfolioValueUSD !== null 
                    ? `$${totalPortfolioValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` 
                    : 'Error calculating value'}
                </p>
              )}
               <p className="text-xs text-muted-foreground mt-1">Note: Values are estimates based on mock data and may not reflect real-time market prices.</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Actions/Links Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Account Actions</CardTitle>
            <CardDescription>Manage your account settings and activity.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start text-left h-auto py-3">
              <MessageSquare className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold">My Chats</p>
                <p className="text-xs text-muted-foreground">View active and past trade conversations.</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3">
              <Settings className="mr-3 h-5 w-5" />
               <div>
                <p className="font-semibold">Account Settings</p>
                <p className="text-xs text-muted-foreground">Manage preferences and notifications.</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3">
              <ShieldCheck className="mr-3 h-5 w-5" />
               <div>
                <p className="font-semibold">Security</p>
                <p className="text-xs text-muted-foreground">Manage 2FA and login activity.</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3">
              <Info className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold">Help & Support</p>
                <p className="text-xs text-muted-foreground">Find answers or contact support.</p>
              </div>
            </Button>
             <Button variant="outline" className="justify-start text-left h-auto py-3" onClick={() => alert("Link to external documentation/FAQ (mock)")}>
              <ExternalLink className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold">FAQ & Docs</p>
                <p className="text-xs text-muted-foreground">Learn more about AnonTrade.</p>
              </div>
            </Button>
            <Button variant="destructive" className="justify-start text-left h-auto py-3 sm:col-span-2 lg:col-span-1">
              <LogOut className="mr-3 h-5 w-5" />
               <div>
                <p className="font-semibold">Log Out</p>
                <p className="text-xs text-white/80">Sign out of your account.</p>
              </div>
            </Button>
          </CardContent>
        </Card>

      </main>
      <BottomNavigationBar />
    </div>
  );
}
