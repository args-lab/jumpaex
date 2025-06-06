import type { LucideIcon } from 'lucide-react';

export interface Asset {
  id: string;
  name: string;
  price: number;
  currency: string;
  region: string;
  network: string;
  icon?: LucideIcon | string; // Can be LucideIcon or path to SVG/image
  volume: number;
  change24h: number; // Percentage change
  seller: string; // Placeholder for seller info
}

export interface Region {
  id: string;
  name: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
}

export interface BlockchainNetwork {
  id: string;
  name: string;
  icon?: LucideIcon | string;
}
