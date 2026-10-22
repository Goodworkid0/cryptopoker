import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonMumbai, hardhat, mainnet, arbitrum, optimism, base } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'demo';

// Supported chains - Polygon as primary, plus other popular chains
export const supportedChains = [polygon, mainnet, arbitrum, optimism, base, polygonMumbai, hardhat] as const;

export const config = getDefaultConfig({
  appName: 'CryptoPoker',
  projectId,
  chains: supportedChains,
  ssr: true,
});
