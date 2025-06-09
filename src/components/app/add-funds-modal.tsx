
'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, CreditCard, ArrowDownToLine, ChevronRight, Store } from 'lucide-react';
import type * as React from 'react';

interface AddFundsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNavigateToBuyWithFiat: () => void;
  onNavigateToReceive: () => void;
  onOpenDepositCryptoModal: () => void;
}

interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  showChevron?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({ icon: Icon, title, description, onClick, showChevron = true }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full p-3.5 text-left bg-card hover:bg-muted/50 rounded-lg transition-colors border"
  >
    <Icon className="h-6 w-6 mr-4 text-primary shrink-0" />
    <div className="flex-grow">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    {showChevron && <ChevronRight className="h-5 w-5 text-muted-foreground ml-2 shrink-0" />}
  </button>
);


export function AddFundsModal({
  isOpen,
  onOpenChange,
  onNavigateToBuyWithFiat,
  onNavigateToReceive,
  onOpenDepositCryptoModal,
}: AddFundsModalProps) {
  const router = useRouter(); 

  const handleNavigateToP2P = () => {
    router.push('/market');
    onOpenChange(false); 
  };

  const depositOptions = [
    { 
      icon: ArrowDownToLine, 
      title: 'On-Chain Deposit', 
      description: 'Deposit Crypto from other exchanges/wallets to Binance', 
      action: onOpenDepositCryptoModal 
    },
    { 
      icon: Users, 
      title: 'Receive from Binance users', 
      description: 'Binance internal transfer, receive via Email/Phone/ID', 
      action: onNavigateToReceive 
    },
    { 
      icon: CreditCard, 
      title: 'Buy with IDR', 
      description: 'Buy crypto easily via bank transfer, card, and more.', 
      action: onNavigateToBuyWithFiat 
    },
    { 
      icon: Store, 
      title: 'P2P Trading', 
      description: 'Buy directly from users. Competitive pricing. Local payments.', 
      action: handleNavigateToP2P 
    },
  ];


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 flex flex-col h-full sm:h-auto sm:max-h-[95vh] bg-background">
        <DialogHeader className="flex flex-row items-center justify-between p-3 border-b sticky top-0 bg-background z-10">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <DialogTitle className="text-base font-semibold">Select Deposit Method</DialogTitle>
          <Button variant="outline" size="sm" className="text-xs h-8 px-2.5 bg-card hover:bg-card/90 border-border invisible"> {/* Made currency button invisible as per new design */}
            <div className="flex items-center justify-center h-5 w-5 mr-1.5 rounded-full bg-red-600 text-white text-[9px] font-semibold leading-none">
              Rp
            </div>
            IDR
          </Button>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {depositOptions.map((opt, index) => (
            <OptionCard 
              key={index} 
              icon={opt.icon} 
              title={opt.title} 
              description={opt.description} 
              onClick={opt.action} 
              showChevron={false} // Chevron is not shown in the reference image for these options
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
