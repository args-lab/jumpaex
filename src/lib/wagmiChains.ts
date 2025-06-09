
import { mainnet, sepolia } from 'viem/chains';
import type { Chain } from 'viem/chains';

// Define the chains your app will support
export const chains: readonly [Chain, ...Chain[]] = [mainnet, sepolia];
