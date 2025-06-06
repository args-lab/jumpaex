
'use client';

import type * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Region } from '@/types';
import { MapPin } from 'lucide-react';

interface RegionSelectorProps {
  regions: Region[];
  selectedRegion: string;
  onRegionChange: (regionId: string) => void;
  id?: string; 
}

export function RegionSelector({
  regions,
  selectedRegion,
  onRegionChange,
  id, 
}: RegionSelectorProps) {
  return (
    <Select value={selectedRegion} onValueChange={onRegionChange}>
      <SelectTrigger id={id} className="w-full"> 
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select Region" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {regions.map((region) => (
          <SelectItem key={region.id} value={region.id}>
            {region.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
