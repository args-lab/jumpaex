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
  className?: string;
}

export function BlockchainFilter({
  networks,
  selectedNetwork,
  onNetworkChange,
  className,
}: BlockchainFilterProps) {
  return (
    <div className={className}>
      <Select value={selectedNetwork} onValueChange={onNetworkChange}>
        <SelectTrigger className="w-full md:w-[200px]">
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
    </div>
  );
}
