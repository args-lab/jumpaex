
'use client';

import { Header } from '@/components/app/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinkIcon, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ConnectWalletPage() {
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
            <Alert variant="default" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Feature Under Construction</AlertTitle>
              <AlertDescription>
                Wallet connection functionality is currently being configured. Please check back soon.
                If you intended to use specific wallet packages, ensure they are correctly installed and configured.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button disabled>Connect Wallet (Coming Soon)</Button>
            </div>
            <div className="flex items-center text-xs text-muted-foreground justify-center pt-2">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              <span>Secure wallet connection</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
