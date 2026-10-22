import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'CryptoPoker - Play Poker with Crypto',
  description: 'The ultimate crypto poker platform. Play Texas Hold\'em with PKC tokens, earn rewards, and compete in tournaments.',
  keywords: ['poker', 'crypto', 'blockchain', 'gaming', 'PKC', 'cryptocurrency'],
  openGraph: {
    title: 'CryptoPoker',
    description: 'Play Poker with Crypto',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
