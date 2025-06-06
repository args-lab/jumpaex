
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
import { ClipboardCopy, AlertTriangle, CheckCircle } from 'lucide-react';
import type { DepositableAsset, BlockchainNetwork } from '@/types';
import { depositableAssets as allDepositableAssets, mockBlockchainNetworks, generateMockAddress } from '@/data/mock';
import { useToast } from '@/hooks/use-toast';

interface DepositModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function DepositModal({ isOpen, onOpenChange }: DepositModalProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(undefined);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | undefined>(undefined);
  const [generatedAddress, setGeneratedAddress] = useState<string>('');
  const { toast } = useToast();

  const selectedAsset = useMemo(() => {
    return allDepositableAssets.find(asset => asset.id === selectedAssetId);
  }, [selectedAssetId]);

  const availableNetworks = useMemo(() => {
    if (!selectedAsset) return [];
    return mockBlockchainNetworks.filter(network => selectedAsset.supportedNetworks.includes(network.id) && network.id !== 'all');
  }, [selectedAsset]);

  useEffect(() => {
    // Reset network and address if asset changes
    setSelectedNetworkId(undefined);
    setGeneratedAddress('');
  }, [selectedAssetId]);

  useEffect(() => {
    if (selectedAsset && selectedNetworkId) {
      const networkInfo = mockBlockchainNetworks.find(n => n.id === selectedNetworkId);
      if (networkInfo) {
        setGeneratedAddress(generateMockAddress(selectedAsset.symbol, selectedNetworkId));
      } else {
        setGeneratedAddress('');
      }
    } else {
      setGeneratedAddress('');
    }
  }, [selectedAsset, selectedNetworkId]);
  
  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId);
    // If the new asset supports only one network, auto-select it.
    const asset = allDepositableAssets.find(a => a.id === assetId);
    if (asset && asset.supportedNetworks.length === 1) {
        const supportedNetwork = mockBlockchainNetworks.find(n => n.id === asset.supportedNetworks[0]);
        if (supportedNetwork) {
             setSelectedNetworkId(supportedNetwork.id);
        }
    }
  };


  const handleCopyToClipboard = async () => {
    if (!generatedAddress) return;
    try {
      await navigator.clipboard.writeText(generatedAddress);
      toast({
        title: 'Copied to clipboard!',
        description: 'Deposit address copied successfully.',
        variant: 'default',
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy address to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Deposit Funds</DialogTitle>
          <DialogDescription>
            Select the asset and network to generate a deposit address.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-asset">Asset to Deposit</Label>
            <Select value={selectedAssetId} onValueChange={handleAssetChange}>
              <SelectTrigger id="deposit-asset">
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
              <Label htmlFor="deposit-network">Network</Label>
              <Select
                value={selectedNetworkId}
                onValueChange={setSelectedNetworkId}
                disabled={availableNetworks.length === 0}
              >
                <SelectTrigger id="deposit-network">
                  <SelectValue placeholder={availableNetworks.length > 0 ? "Select network" : "No supported networks for this asset"} />
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

          {generatedAddress && selectedAsset && selectedNetworkId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="deposit-address">Your {selectedAsset.symbol} Deposit Address</Label>
                <div className="flex items-center space-x-2">
                  <Input id="deposit-address" value={generatedAddress} readOnly className="flex-grow" />
                  <Button variant="outline" size="icon" onClick={handleCopyToClipboard} aria-label="Copy address">
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Notice</AlertTitle>
                <AlertDescription>
                  Only send {selectedAsset.symbol} on the {mockBlockchainNetworks.find(n=>n.id === selectedNetworkId)?.name || 'selected'} network to this address.
                  Sending any other asset or using a different network may result in permanent loss of funds.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
