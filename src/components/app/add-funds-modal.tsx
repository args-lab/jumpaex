
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, CreditCard, Navigation, ArrowDownToLine, ChevronRight } from 'lucide-react';
import type * as React from 'react';

interface AddFundsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNavigateToP2P: () => void;
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
  onNavigateToP2P,
  onNavigateToBuyWithFiat,
  onNavigateToReceive,
  onOpenDepositCryptoModal,
}: AddFundsModalProps) {

  const optionsNoCrypto = [
    { icon: Users, title: 'Buy with IDR (P2P)', description: 'Buy from users. Competitive prices. Local payments', action: onNavigateToP2P },
    { icon: CreditCard, title: 'Buy with IDR', description: 'Buy crypto easily via bank transfer, card, and more.', action: onNavigateToBuyWithFiat },
    { icon: Navigation, title: 'Receive via Pay', description: 'Receive crypto from other Binance users', action: onNavigateToReceive },
  ];

  const optionsHaveCrypto = [
    { icon: ArrowDownToLine, title: 'Deposit Crypto', description: 'Send crypto to your Binance Account', action: onOpenDepositCryptoModal },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 flex flex-col h-full sm:h-auto sm:max-h-[95vh] bg-muted/20"> {/* Changed background to muted/20 for less stark white */}
        <DialogHeader className="flex flex-row items-center justify-between p-3 border-b sticky top-0 bg-background z-10">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
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

          {/* Separator might not be needed if background difference is subtle, but keeping for structure */}
          {/* <Separator className="my-5 bg-border/50" />  */}

          <div className="pt-2"> {/* Added padding top for visual separation if separator is removed */}
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
