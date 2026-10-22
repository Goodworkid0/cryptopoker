'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { useState } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { GameProvider } from '@/context/GameContext';

import '@rainbow-me/rainbowkit/styles.css';

// Custom crypto poker theme
const cryptoPokerTheme = darkTheme({
  accentColor: '#00ff88',
  accentColorForeground: '#0a0e17',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={cryptoPokerTheme}
          modalSize="wide"
          showRecentTransactions={true}
          appInfo={{
            appName: 'CryptoPoker',
            learnMoreUrl: 'https://cryptopoker.com/learn',
            disclaimer: ({ Text, Link }) => (
              <Text>
                By connecting your wallet, you agree to our{' '}
                <Link href="/terms">Terms of Service</Link> and{' '}
                <Link href="/privacy">Privacy Policy</Link>
              </Text>
            ),
          }}
        >
          <AuthProvider>
            <GameProvider>
              {children}
            </GameProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
