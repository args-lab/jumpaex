
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Send, Loader2 } from 'lucide-react';
import type { DepositableAsset, BlockchainNetwork } from '@/types';
import { depositableAssets as allDepositableAssets, mockBlockchainNetworks } from '@/data/mock';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WithdrawModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Mock fee, can be dynamic later
const MOCK_NETWORK_FEE = 0.0005; // Example fee in the asset's unit

export function WithdrawModal({ isOpen, onOpenChange }: WithdrawModalProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(undefined);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const { toast } = useToast();

  const selectedAsset = useMemo(() => {
    return allDepositableAssets.find(asset => asset.id === selectedAssetId);
  }, [selectedAssetId]);

  const availableNetworks = useMemo(() => {
    if (!selectedAsset) return [];
    return mockBlockchainNetworks.filter(network => selectedAsset.supportedNetworks.includes(network.id) && network.id !== 'all');
  }, [selectedAsset]);

  useEffect(() => {
    // Reset dependent fields when asset changes
    setSelectedNetworkId(undefined);
    setAmount('');
    setAddress('');
  }, [selectedAssetId]);
  
  useEffect(() => {
    // Reset amount and address if network changes
    setAmount('');
    setAddress('');
  }, [selectedNetworkId]);

  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId);
    // If the new asset supports only one network, auto-select it.
    const asset = allDepositableAssets.find(a => a.id === assetId);
    if (asset && asset.supportedNetworks.length === 1) {
        const supportedNetwork = mockBlockchainNetworks.find(n => n.id === asset.supportedNetworks[0]);
        if (supportedNetwork) {
             setSelectedNetworkId(supportedNetwork.id);
        }
    } else {
      setSelectedNetworkId(undefined); // Clear network if multiple options or no auto-selection
    }
  };

  const numericAmount = parseFloat(amount);
  const netAmount = numericAmount > 0 ? numericAmount - MOCK_NETWORK_FEE : 0;

  const handleWithdraw = async () => {
    if (!selectedAsset || !selectedNetworkId || !numericAmount || numericAmount <= 0 || !address.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all fields correctly.',
        variant: 'destructive',
      });
      return;
    }
    if (numericAmount <= MOCK_NETWORK_FEE) {
      toast({
        title: 'Amount Too Low',
        description: `Withdrawal amount must be greater than the network fee of ${MOCK_NETWORK_FEE} ${selectedAsset.symbol}.`,
        variant: 'destructive',
      });
      return;
    }

    setIsWithdrawing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsWithdrawing(false);

    toast({
      title: 'Withdrawal Initiated (Mock)',
      description: `Your withdrawal of ${netAmount.toFixed(6)} ${selectedAsset.symbol} to ${address} has been initiated.`,
      action: <CheckCircle className="text-green-500" />,
    });
    onOpenChange(false); // Close modal on success
    // Reset form for next time
    setSelectedAssetId(undefined); 
    setSelectedNetworkId(undefined);
    setAmount('');
    setAddress('');
  };
  
  const resetForm = () => {
    setSelectedAssetId(undefined);
    setSelectedNetworkId(undefined);
    setAmount('');
    setAddress('');
    setIsWithdrawing(false);
  }

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Withdraw Funds</DialogTitle>
          <DialogDescription>
            Select asset, network, and enter amount and address to withdraw.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-asset">Asset to Withdraw</Label>
            <Select value={selectedAssetId} onValueChange={handleAssetChange} disabled={isWithdrawing}>
              <SelectTrigger id="withdraw-asset">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {allDepositableAssets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id}>
                    <div className="flex items-center">
                      {asset.icon && typeof asset.icon !== 'string' && <asset.icon className="mr-2 h-5 w-5" />}
                      {asset.name} ({asset.symbol})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAsset && (
            <div className="space-y-2">
              <Label htmlFor="withdraw-network">Network</Label>
              <Select
                value={selectedNetworkId}
                onValueChange={setSelectedNetworkId}
                disabled={availableNetworks.length === 0 || isWithdrawing}
              >
                <SelectTrigger id="withdraw-network">
                  <SelectValue placeholder={availableNetworks.length > 0 ? "Select network" : "No supported networks"} />
                </SelectTrigger>
                <SelectContent>
                  {availableNetworks.map(network => (
                    <SelectItem key={network.id} value={network.id}>
                       <div className="flex items-center">
                        {network.icon && typeof network.icon !== 'string' && <network.icon className="mr-2 h-5 w-5" />}
                        {network.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedAsset && selectedNetworkId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount</Label>
                <Input 
                  id="withdraw-amount" 
                  type="number" 
                  placeholder={`e.g., 0.1 ${selectedAsset.symbol}`} 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isWithdrawing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-address">Destination Address</Label>
                <Input 
                  id="withdraw-address" 
                  type="text" 
                  placeholder={`Enter ${selectedAsset.symbol} address on ${mockBlockchainNetworks.find(n=>n.id === selectedNetworkId)?.name || 'selected'} network`}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isWithdrawing}
                />
              </div>
              
              {numericAmount > 0 && (
                <div className="text-sm text-muted-foreground space-y-1 p-2 border rounded-md bg-muted/50">
                  <div className="flex justify-between">
                    <span>Network Fee (approx.):</span>
                    <span>{MOCK_NETWORK_FEE.toFixed(Math.max(4, selectedAsset.symbol === 'BTC' ? 8: 4))} {selectedAsset.symbol}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>You will receive:</span>
                    <span>{netAmount > 0 ? netAmount.toFixed(Math.max(4, selectedAsset.symbol === 'BTC' ? 8: 4)) : '0.00'} {selectedAsset.symbol}</span>
                  </div>
                </div>
              )}

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical: Verify Address & Network</AlertTitle>
                <AlertDescription>
                  Ensure the address is correct and belongs to the {mockBlockchainNetworks.find(n=>n.id === selectedNetworkId)?.name || 'selected'} network for {selectedAsset.symbol}.
                  Sending to a wrong address or network will result in permanent loss of funds.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleModalOpenChange(false)} disabled={isWithdrawing}>Cancel</Button>
          <Button 
            onClick={handleWithdraw} 
            disabled={!selectedAsset || !selectedNetworkId || !amount || !address || numericAmount <= MOCK_NETWORK_FEE || isWithdrawing}
            className={cn(isWithdrawing && "bg-primary/80")}
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Withdraw
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
