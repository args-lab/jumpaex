
'use client';

import { useRouter } from 'next/navigation'; // Import useRouter
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, CreditCard, Navigation, ArrowDownToLine, ChevronRight } from 'lucide-react';
import type * as React from 'react';

interface AddFundsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // onNavigateToP2P: () => void; // This will be handled internally now
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
  // onNavigateToP2P, // Removed from props
  onNavigateToBuyWithFiat,
  onNavigateToReceive,
  onOpenDepositCryptoModal,
}: AddFundsModalProps) {
  const router = useRouter(); // Initialize useRouter

  const handleNavigateToP2P = () => {
    router.push('/market');
    onOpenChange(false); // Close the modal after navigation
  };

  const optionsNoCrypto = [
    { icon: Users, title: 'Buy with IDR (P2P)', description: 'Buy from users. Competitive prices. Local payments', action: handleNavigateToP2P }, // Updated action
    { icon: CreditCard, title: 'Buy with IDR', description: 'Buy crypto easily via bank transfer, card, and more.', action: onNavigateToBuyWithFiat },
    { icon: Navigation, title: 'Receive via Pay', description: 'Receive crypto from other Binance users', action: onNavigateToReceive },
  ];

  const optionsHaveCrypto = [
    { icon: ArrowDownToLine, title: 'Deposit Crypto', description: 'Send crypto to your Binance Account', action: onOpenDepositCryptoModal },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 flex flex-col h-full sm:h-auto sm:max-h-[95vh] bg-background">
        <DialogHeader className="flex flex-row items-center justify-between p-3 border-b sticky top-0 bg-background z-10">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <DialogTitle className="sr-only">Add Funds Options</DialogTitle>
          <Button variant="outline" size="sm" className="text-xs h-8 px-2.5 bg-card hover:bg-card/90 border-border">
            <div className="flex items-center justify-center h-5 w-5 mr-1.5 rounded-full bg-red-600 text-white text-[9px] font-semibold leading-none">
              Rp
            </div>
            IDR
          </Button>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-4 space-y-5">
          <div>
            <h2 className="text-base font-semibold mb-2.5 ml-1">I don't have crypto assets</h2>
            <div className="space-y-3">
              {optionsNoCrypto.map((opt, index) => (
                <OptionCard key={index} icon={opt.icon} title={opt.title} description={opt.description} onClick={opt.action} />
              ))}
            </div>
          </div>

          <div className="pt-2">
             <h2 className="text-base font-semibold mb-2.5 ml-1">I have crypto assets</h2>
            <div className="space-y-3">
              {optionsHaveCrypto.map((opt, index) => (
                <OptionCard key={index} icon={opt.icon} title={opt.title} description={opt.description} onClick={opt.action} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
