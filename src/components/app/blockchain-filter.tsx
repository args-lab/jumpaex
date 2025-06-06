
'use client';

import type * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BlockchainNetwork } from '@/types';
import { Network } from 'lucide-react';

interface BlockchainFilterProps {
  networks: BlockchainNetwork[];
  selectedNetwork: string;
  onNetworkChange: (networkId: string) => void;
  id?: string; 
}

export function BlockchainFilter({
  networks,
  selectedNetwork,
  onNetworkChange,
  id, 
}: BlockchainFilterProps) {
  return (
    <Select value={selectedNetwork} onValueChange={onNetworkChange}>
      <SelectTrigger id={id} className="w-full"> 
        <div className="flex items-center">
          <Network className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select Network" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {networks.map((network) => (
          <SelectItem key={network.id} value={network.id}>
            <div className="flex items-center">
              {network.icon && typeof network.icon !== 'string' && (
                <network.icon className="mr-2 h-4 w-4" />
              )}
              {network.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
