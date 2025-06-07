
'use client';

import { useState, type FormEvent, useEffect, Suspense } from 'react'; // Added Suspense
import { useParams, useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/app/header';
import { BottomNavigationBar } from '@/components/app/bottom-navigation-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SendHorizonal, UserCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import type { Asset, MockSeller } from '@/types';
import { mockAssets, mockSellers, depositableAssets } from '@/data/mock'; // Added depositableAssets

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
}

interface ChatInitialData {
  tradeType?: 'buy' | 'sell';
  fiatAmount?: string;
  cryptoAmount?: string;
  fiatCurrency?: string;
  cryptoAssetSymbol?: string;
  pricePerCrypto?: string;
}

function ChatPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams(); // For reading initial trade data

  const assetId = typeof params.assetId === 'string' ? params.assetId : '';
  const sellerId = typeof params.sellerId === 'string' ? params.sellerId : '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [asset, setAsset] = useState<Asset | null | undefined>(undefined);
  const [seller, setSeller] = useState<MockSeller | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [initialTradeData, setInitialTradeData] = useState<ChatInitialData | null>(null);

  useEffect(() => {
    const tradeType = searchParams.get('tradeType') as 'buy' | 'sell' | undefined;
    const fiatAmount = searchParams.get('fiatAmount');
    const cryptoAmount = searchParams.get('cryptoAmount');
    const fiatCurrency = searchParams.get('fiatCurrency');
    const cryptoAssetSymbol = searchParams.get('cryptoAssetSymbol');
    const pricePerCrypto = searchParams.get('pricePerCrypto');

    if (tradeType && cryptoAssetSymbol) {
      setInitialTradeData({
        tradeType,
        fiatAmount: fiatAmount || undefined,
        cryptoAmount: cryptoAmount || undefined,
        fiatCurrency: fiatCurrency || undefined,
        cryptoAssetSymbol: cryptoAssetSymbol || undefined,
        pricePerCrypto: pricePerCrypto || undefined,
      });
    }
  }, [searchParams]);


  useEffect(() => {
    if (assetId && sellerId) {
      // Try to find asset by ID from mockAssets, or by symbol from depositableAssets if ID is a symbol
      let foundAsset = mockAssets.find(a => a.id === assetId);
      if (!foundAsset) {
          const depoAsset = depositableAssets.find(da => da.id === assetId || da.symbol === assetId);
          if (depoAsset) {
            // Construct a minimal Asset-like object for display
            foundAsset = {
                id: depoAsset.id,
                name: depoAsset.name,
                // These might not be directly available or relevant for P2P offer context
                price: 0, 
                currency: initialTradeData?.fiatCurrency || 'USD', 
                region: 'global',
                network: depoAsset.supportedNetworks[0] || 'unknown',
                icon: depoAsset.icon,
                volume: 0,
                change24h: 0,
                seller: '', // Seller info comes from foundSeller
            };
          }
      }
      
      const foundSeller = mockSellers.find(s => s.id === sellerId || `mockSeller_${s.name.replace(/\s+/g, '')}` === sellerId);
      setAsset(foundAsset || null);
      setSeller(foundSeller || null);
      setIsLoading(false);
    }
  }, [assetId, sellerId, initialTradeData]);

  useEffect(() => {
    let initialMessages: Message[] = [];
    if (asset && seller) {
      let greeting = `Hello! I'm interested in your offer for ${asset.name}.`;
      if (initialTradeData) {
        greeting = `Hi ${seller.name}, I'd like to ${initialTradeData.tradeType} ${initialTradeData.cryptoAmount ? parseFloat(initialTradeData.cryptoAmount).toFixed(4) : ''} ${initialTradeData.cryptoAssetSymbol} (approx. ${initialTradeData.fiatAmount ? parseFloat(initialTradeData.fiatAmount).toFixed(2) : ''} ${initialTradeData.fiatCurrency}). My order reference is from the confirmation page.`;
      }
      initialMessages.push({
        id: '1',
        text: greeting,
        sender: 'user', // User initiates after order confirmation
        timestamp: new Date(),
      });
    }
    // Simulate a reply from the seller
    if (initialMessages.length > 0) {
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                id: String(Date.now() + 1),
                text: "Hi there! Thanks for your order. How can I help you proceed?",
                sender: 'other',
                timestamp: new Date(),
                },
            ]);
        }, 1200);
    }
    setMessages(initialMessages);
  }, [asset, seller, initialTradeData]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const message: Message = {
      id: String(Date.now()),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, message]);
    setNewMessage('');
    // Simulate a reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          text: "Okay, let's discuss the details.",
          sender: 'other',
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 pt-8 pb-20 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Loading chat...</p>
        </main>
        <BottomNavigationBar />
      </div>
    );
  }

  if (!asset || !seller) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 pt-8 pb-20">
          <div className="mb-6">
            <Button variant="outline" asChild className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Chat Not Found</AlertTitle>
              <AlertDescription>
                The asset or seller for this chat could not be found.
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <BottomNavigationBar />
      </div>
    );
  }
  
  const AssetIconComponent = asset.icon && typeof asset.icon !== 'string' ? asset.icon : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24 flex flex-col h-[calc(100vh-var(--header-height,4rem)-var(--bottom-nav-height,4rem))]">
        <div className="mb-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <div className="flex items-center space-x-2 text-right">
                 {AssetIconComponent && <AssetIconComponent className="h-8 w-8 text-primary hidden sm:block" />}
                 {typeof asset.icon === 'string' && <Image src={asset.icon} alt={asset.name} width={32} height={32} className="rounded-full hidden sm:block" data-ai-hint={`${asset.name} logo`} />}
                <h1 className="text-xl sm:text-2xl font-headline font-bold">
                    Chat with {seller.name} <span className="text-muted-foreground text-sm font-normal">({asset.name})</span>
                </h1>
            </div>
        </div>

        <ScrollArea className="flex-grow p-4 border rounded-md my-4 bg-muted/30">
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${
                  msg.sender === 'user' ? 'justify-end' : ''
                }`}
              >
                {msg.sender === 'other' && <UserCircle className="h-8 w-8 text-muted-foreground" />}
                <div
                  className={`p-3 rounded-lg max-w-[70%] shadow ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {msg.sender === 'user' && <UserCircle className="h-8 w-8 text-primary" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2 items-center py-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon" aria-label="Send message">
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </main>
      <BottomNavigationBar />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading chat interface...</div>}>
      <ChatPageContent />
    </Suspense>
  )
}

    