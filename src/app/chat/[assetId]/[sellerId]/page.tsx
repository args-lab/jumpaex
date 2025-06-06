
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { mockAssets, mockSellers } from '@/data/mock';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = typeof params.assetId === 'string' ? params.assetId : '';
  const sellerId = typeof params.sellerId === 'string' ? params.sellerId : '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [asset, setAsset] = useState<Asset | null | undefined>(undefined);
  const [seller, setSeller] = useState<MockSeller | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (assetId && sellerId) {
      const foundAsset = mockAssets.find(a => a.id === assetId);
      const foundSeller = mockSellers.find(s => s.id === sellerId);
      setAsset(foundAsset || null);
      setSeller(foundSeller || null);
      setIsLoading(false);
    }
  }, [assetId, sellerId]);

  useEffect(() => {
    if (asset && seller) {
      setMessages([
        {
          id: '1',
          text: `Hello! I'm interested in your listing for ${asset.name} offered by ${seller.name}.`,
          sender: 'other',
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [asset, seller]);

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24 flex flex-col h-[calc(100vh-var(--header-height,4rem)-var(--bottom-nav-height,4rem))]">
        <div className="mb-4 flex items-center justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/find-seller/${assetId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sellers
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
                 {asset.icon && typeof asset.icon !== 'string' && <asset.icon className="h-8 w-8 text-primary hidden sm:block" />}
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
