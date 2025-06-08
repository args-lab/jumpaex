
'use client';

import { Header } from '@/components/app/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { LinkIcon, LogOut, ShieldCheck } from 'lucide-react';

export default function ConnectWalletPage() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <LinkIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Connect Your Wallet</CardTitle>
            <CardDescription>
              Securely connect to decentralized applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected ? (
              <Button size="lg" className="w-full h-12 text-base" onClick={() => open()}>
                Connect Wallet
              </Button>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="p-3 border rounded-md bg-muted/50">
                  <p className="font-medium break-all">Connected: {address}</p>
                  {chain && <p className="text-xs text-muted-foreground">Network: {chain.name}</p>}
                </div>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full h-12 text-base"
                  onClick={() => disconnect()}
                >
                  <LogOut className="mr-2 h-5 w-5" /> Disconnect
                </Button>
              </div>
            )}
            <div className="flex items-center text-xs text-muted-foreground justify-center pt-2">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              <span>Powered by WalletConnect & Web3Modal</span>
            </div>
          </CardContent>
        </Card>
      </main>
      {/* BottomNavigationBar will be rendered by layout.tsx */}
    </div>
  );
}
