
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import type { Asset, MockSeller } from '@/types';
import { mockSellers } from '@/data/mock'; // Assuming you have this mock data
import { ChatModal } from '@/components/app/chat-modal';

interface FindSellerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  asset: Asset | null;
}

export function FindSellerModal({ isOpen, onOpenChange, asset }: FindSellerModalProps) {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  // selectedAssetForChat is already 'asset' prop here
  // We might need a selectedSellerForChat if ChatModal needs specific seller info
  const [selectedSellerForChat, setSelectedSellerForChat] = useState<MockSeller | null>(null);

  if (!asset) return null;

  const handleChatWithSellerClick = (seller: MockSeller) => {
    setSelectedSellerForChat(seller);
    setIsChatModalOpen(true);
  };
  
  // Combine original lister with other mock sellers
  const displaySellers: MockSeller[] = [];
  if(asset.seller) {
    const originalLister: MockSeller | undefined = mockSellers.find(s => s.name === asset.seller) || 
                                                 { id: 'originalLister', name: asset.seller, reputation: undefined, avgTradeTime: undefined };
    if (originalLister) displaySellers.push(originalLister);
  }
  mockSellers.forEach(ms => {
    if (!displaySellers.find(ds => ds.id === ms.id)) {
      displaySellers.push(ms);
    }
  });


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col h-[85vh] max-h-[750px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Find Sellers for {asset.name}</DialogTitle>
            <DialogDescription>
              Here are sellers offering {asset.name}. Click chat to discuss.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow p-1 border rounded-md my-4 bg-muted/20">
            <div className="space-y-3 p-3">
              {displaySellers.map((seller) => (
                <Card key={seller.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <User className="h-8 w-8 text-primary" />
                            <CardTitle className="text-lg">{seller.name}</CardTitle>
                        </div>
                        {seller.name === asset.seller && (
                             <span className="text-xs bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full">Original Lister</span>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2 text-sm">
                    {seller.reputation !== undefined && (
                      <div className="flex items-center text-muted-foreground">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        Reputation: {seller.reputation}%
                      </div>
                    )}
                    {seller.avgTradeTime && (
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        Avg. Trade Time: {seller.avgTradeTime}
                      </div>
                    )}
                     <Button 
                        onClick={() => handleChatWithSellerClick(seller)} 
                        size="sm" 
                        className="w-full mt-2"
                        variant="outline"
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat with {seller.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {displaySellers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No sellers found for this asset currently.</p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ChatModal is now managed by FindSellerModal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onOpenChange={setIsChatModalOpen}
        asset={asset} // Pass the original asset context
        // sellerName={selectedSellerForChat?.name} // Optional: if ChatModal is updated to use sellerName
      />
    </>
  );
}
