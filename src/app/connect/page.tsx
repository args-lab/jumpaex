
'use client';

import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinkIcon, ShieldCheck, UserCircle, LogOut, Copy } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

export default function ConnectWalletPage() {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  const handleCopyToClipboard = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Address Copied!',
        description: 'Wallet address copied to clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy address.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24 flex flex-col items-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <LinkIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">
              {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
            </CardTitle>
            <CardDescription>
              {isConnected
                ? 'Manage your connection or disconnect.'
                : 'Securely connect to decentralized applications using Web3Modal.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isConnected && address ? (
              <div className="space-y-4">
                <div className="flex items-center p-3 border rounded-md bg-muted/50">
                  <UserCircle className="h-8 w-8 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Connected Account:</p>
                    <p className="text-sm font-mono font-semibold break-all">
                      {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8"
                    onClick={() => handleCopyToClipboard(address)}
                    title="Copy address"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {connector?.name && (
                  <p className="text-xs text-muted-foreground text-center">
                    Connected with: <span className="font-medium text-foreground">{connector.name}</span>
                  </p>
                )}
                <Button onClick={() => disconnect()} variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Disconnect Wallet
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                {/* Web3Modal's button handles its own state and appearance */}
                <w3m-button />
              </div>
            )}
            <div className="flex items-center text-xs text-muted-foreground justify-center pt-2">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              <span>Secure wallet connection via Web3Modal</span>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNavigationBar />
    </div>
  );
}
