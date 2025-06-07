
'use client';

import { useState, type FormEvent, useEffect, Suspense, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, MoreHorizontal, PlusCircle, SendHorizonal, ShieldCheck, Ban, AlertTriangle } from 'lucide-react';
import type { Asset, MockSeller } from '@/types';
import { mockAssets, mockSellers, depositableAssets, mockCurrencies } from '@/data/mock';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text?: string;
  sender: 'user' | 'other' | 'system' | 'system-banner';
  timestamp?: Date;
  type?: 'order_created_banner' | 'seller_instructions' | 'welcome_banner' | 'new_messages_divider';
  orderId?: string;
  fiatAmount?: string; 
  fiatCurrency?: string;
  payWithin?: string; 
  detailedInstructions?: {
    title: string;
    items: string[];
    note: string;
  };
}

interface ChatInitialData {
  tradeType?: 'buy' | 'sell';
  fiatAmount?: string;
  cryptoAmount?: string;
  fiatCurrency?: string;
  cryptoAssetSymbol?: string;
  pricePerCrypto?: string;
  orderId?: string;
  sellerName?: string;
}

const formatFiatDisplay = (value: number, currencyCode: string, locale: string | undefined): string => {
  if (isNaN(value) || !isFinite(value)) return `${mockCurrencies.find(c=>c.id.toUpperCase() === currencyCode.toUpperCase())?.symbol || currencyCode}0.00`;
  const targetCurrencyInfo = mockCurrencies.find(c => c.id.toUpperCase() === currencyCode.toUpperCase() || c.symbol.toUpperCase() === currencyCode.toUpperCase());
  const displaySymbol = targetCurrencyInfo?.symbol || currencyCode.toUpperCase();
  const fractionDigits = currencyCode.toUpperCase() === 'IDR' ? 0 : 2;

  try {
    return value.toLocaleString(locale, { style: 'currency', currency: targetCurrencyInfo?.id || currencyCode.toUpperCase(), minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
  } catch (e) {
    return `${value.toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })} ${displaySymbol}`;
  }
};


function ChatPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const assetId = typeof params.assetId === 'string' ? params.assetId : '';
  const sellerId = typeof params.sellerId === 'string' ? params.sellerId : '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [initialTradeData, setInitialTradeData] = useState<ChatInitialData | null>(null);
  const [isInitialTradeDataLoaded, setIsInitialTradeDataLoaded] = useState(false);

  const [asset, setAsset] = useState<Asset | null | undefined>(undefined);
  const [seller, setSeller] = useState<MockSeller | null | undefined>(undefined);
  const [isLoadingAssetSeller, setIsLoadingAssetSeller] = useState(true); 
  
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const [payWithinTimer, setPayWithinTimer] = useState<string>("13:53");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(navigator.language);
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => { // Step 1: Load initialTradeData from searchParams
    const tradeType = searchParams.get('tradeType') as 'buy' | 'sell' | undefined;
    const cryptoAssetSymbol = searchParams.get('cryptoAssetSymbol') || undefined;

    if (tradeType && cryptoAssetSymbol) {
      setInitialTradeData({
        tradeType: tradeType,
        fiatAmount: searchParams.get('fiatAmount') || undefined,
        cryptoAmount: searchParams.get('cryptoAmount') || undefined,
        fiatCurrency: searchParams.get('fiatCurrency') || undefined,
        cryptoAssetSymbol: cryptoAssetSymbol,
        pricePerCrypto: searchParams.get('pricePerCrypto') || undefined,
        orderId: searchParams.get('orderId') || `xx${Math.floor(Math.random() * 9000) + 1000}`,
        sellerName: searchParams.get('sellerName') || undefined,
      });
    } else {
      setInitialTradeData(null); // Explicitly null if critical params are missing
      console.error("ChatPage: Missing tradeType or cryptoAssetSymbol in searchParams.", Object.fromEntries(searchParams.entries()));
    }
    setIsInitialTradeDataLoaded(true);
  }, [searchParams]);

  useEffect(() => { // Step 2: Load asset & seller, depends on initialTradeData being processed
    if (!isInitialTradeDataLoaded) {
      return; // Wait for initialTradeData to be processed
    }

    if (!initialTradeData) { // If initialTradeData itself is null (error case from step 1)
        setAsset(null);
        setSeller(null);
        setIsLoadingAssetSeller(false);
        return;
    }

    if (assetId && sellerId) {
      let foundAsset = mockAssets.find(a => a.id.toLowerCase() === assetId.toLowerCase() || a.name.toLowerCase() === assetId.toLowerCase());
       if (!foundAsset) {
          const depoAsset = depositableAssets.find(da => da.id.toLowerCase() === assetId.toLowerCase() || da.symbol.toLowerCase() === assetId.toLowerCase());
          if (depoAsset) {
            foundAsset = {
                id: depoAsset.id, name: depoAsset.name, price: parseFloat(initialTradeData.pricePerCrypto || '0'), 
                currency: initialTradeData.fiatCurrency || 'USD', 
                region: 'global', network: depoAsset.supportedNetworks[0] || 'unknown', icon: depoAsset.icon,
                volume: 0, change24h: 0, seller: '',
            };
          }
      }
      const foundSeller = mockSellers.find(s => s.id === sellerId || `mockSeller_${s.name.replace(/\s+/g, '').toLowerCase()}` === sellerId.toLowerCase());
      
      setAsset(foundAsset || null);
      setSeller(foundSeller || null);
      
      // If sellerName wasn't in query params but we found a seller, update initialTradeData
      if (foundSeller && !initialTradeData.sellerName) {
        setInitialTradeData(prev => ({...prev!, sellerName: foundSeller.name}));
      }

    } else {
        setAsset(null);
        setSeller(null);
    }
    setIsLoadingAssetSeller(false);
  }, [assetId, sellerId, initialTradeData, isInitialTradeDataLoaded]);


  useEffect(() => { // Step 3: Setup initial messages
    if (isLoadingAssetSeller || !isInitialTradeDataLoaded || !initialTradeData || !asset || !seller) return;

    const newMessages: Message[] = [
      { id: 'sys_welcome', type: 'welcome_banner', sender: 'system-banner', text: "Welcome to the new Chatroom. " },
      { id: 'sys_divider', type: 'new_messages_divider', sender: 'system-banner', text: "New order messages" },
      {
        id: 'sys_order_created', type: 'order_created_banner', sender: 'system-banner',
        orderId: initialTradeData.orderId, fiatAmount: initialTradeData.fiatAmount, fiatCurrency: initialTradeData.fiatCurrency,
        text: `Order (${initialTradeData.orderId}) created. Please complete the payment and mark the order as paid in time, or the order will be canceled.`,
      },
      {
        id: 'seller_instr_1', sender: 'other', timestamp: new Date(), type: 'seller_instructions',
        detailedInstructions: {
          title: "💥 NO THIRD PARTY 💥", items: ["NO SINARMAS", "NO GOPAY", "NO SHOPEE PAY", "NO OVO", "NO FLIP"],
          note: "Nama pengirim wajib sama sesuai dengan yang tertera pada Binance."
        }
      }
    ];
    setMessages(newMessages);
  }, [isLoadingAssetSeller, isInitialTradeDataLoaded, initialTradeData, asset, seller, payWithinTimer]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const message: Message = {
      id: String(Date.now()), text: newMessage, sender: 'user', timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: String(Date.now() + 1), text: "Seller received: " + message.text, sender: 'other', timestamp: new Date() },
      ]);
    }, 1000);
  };
  
  if (!isInitialTradeDataLoaded || isLoadingAssetSeller) {
    return <div className="flex h-screen items-center justify-center bg-background">Loading chat...</div>;
  }

  if (!asset || !seller || !initialTradeData) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background">
         <Button variant="outline" className="mb-6 self-start sm:self-center" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Chat</AlertTitle>
          <AlertDescription>
            Chat data could not be loaded. Asset, seller, or trade details might be missing or invalid. Please try navigating back and selecting a trade again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const sellerAvatarInitial = (initialTradeData.sellerName || seller.name).charAt(0).toUpperCase();
  const fiatAmountNum = parseFloat(initialTradeData.fiatAmount || '0');
  const formattedFiat = formatFiatDisplay(fiatAmountNum, initialTradeData.fiatCurrency || 'USD', locale);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between p-3 border-b bg-background shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-sm bg-primary/20 text-primary">{sellerAvatarInitial}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <p className="font-semibold text-sm">{initialTradeData.sellerName || seller.name}</p>
              <ShieldCheck className="ml-1 h-3.5 w-3.5 text-yellow-500 fill-yellow-500/30" />
            </div>
            <p className="text-xs text-muted-foreground">Last seen 1 min(s) ago</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </header>

      <div className="sticky top-[60px] z-10 flex items-center justify-between p-3 border-b bg-background shadow-sm">
        <div>
          <p className="text-sm font-medium">
            {initialTradeData.tradeType === 'buy' ? 'Buy' : 'Sell'} {initialTradeData.cryptoAssetSymbol} with {formattedFiat}
          </p>
          <p className="text-xs text-orange-500">Pay within {payWithinTimer}</p>
        </div>
        <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs h-8 px-3">
          View Payment Details
        </Button>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 bg-muted/20">
        <div className="space-y-4">
          {messages.map(msg => {
            if (msg.type === 'welcome_banner') {
              return (
                <div key={msg.id} className="text-center text-xs text-muted-foreground py-2">
                  {msg.text}<a href="#" className="text-primary underline">Tap</a> to sync old messages to this chatroom, if any.
                </div>
              );
            }
            if (msg.type === 'new_messages_divider') {
              return (
                 <div key={msg.id} className="relative text-center my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                    </div>
                    <span className="relative bg-muted/20 px-2 text-xs text-muted-foreground">{msg.text}</span>
                </div>
              );
            }
            if (msg.type === 'order_created_banner' && msg.orderId) {
              return (
                <div key={msg.id} className="my-2 text-xs text-muted-foreground text-left px-1">
                  {msg.text}
                  <Button variant="link" className="p-0 h-auto text-xs text-yellow-600 hover:text-yellow-700 ml-1">View Payment Details</Button>
                </div>
              );
            }
             if (msg.type === 'seller_instructions' && msg.detailedInstructions) {
              const { title, items, note } = msg.detailedInstructions;
              return (
                <div key={msg.id} className="flex items-end space-x-2">
                  <Avatar className="h-7 w-7 self-start shrink-0">
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">{sellerAvatarInitial}</AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-card shadow-sm max-w-[80%]">
                    <p className="font-semibold text-sm mb-1">{title}</p>
                    <ul className="space-y-0.5 mb-2">
                      {items.map((item, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Ban className="h-3.5 w-3.5 mr-1.5 text-red-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm">{note}</p>
                    {msg.timestamp && (
                      <p className="text-xs text-muted-foreground/80 mt-1.5 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
            return (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}
              >
                {msg.sender === 'other' && (
                  <Avatar className="h-7 w-7 self-start shrink-0">
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">{sellerAvatarInitial}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn("p-2.5 rounded-lg max-w-[75%] shadow-sm", 
                    msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                  {msg.timestamp && (
                    <p className={cn("text-xs mt-1 text-right", msg.sender === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground/80')}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                {msg.sender === 'user' && (
                   <Avatar className="h-7 w-7 self-start shrink-0">
                    <AvatarFallback className="text-xs bg-blue-500 text-white">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <footer className="sticky bottom-0 z-10 flex items-center p-3 border-t bg-background space-x-2">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <PlusCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
        <form onSubmit={handleSendMessage} className="flex-grow flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="h-10 flex-grow bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button type="submit" size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90">
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background">Loading chat interface...</div>}>
      <ChatPageContent />
    </Suspense>
  )
}
    

    

