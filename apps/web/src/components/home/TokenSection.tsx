'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Coins, TrendingUp, Lock, Gift } from 'lucide-react';

const tokenFeatures = [
  {
    icon: Coins,
    title: 'Play & Earn',
    description: 'Use PKC for buy-ins and earn rewards on every hand you play.',
  },
  {
    icon: TrendingUp,
    title: 'Staking Rewards',
    description: 'Stake your PKC tokens and earn up to 15% APY.',
  },
  {
    icon: Lock,
    title: 'VIP Benefits',
    description: 'Hold PKC to unlock exclusive VIP tiers and perks.',
  },
  {
    icon: Gift,
    title: 'Rakeback',
    description: 'Earn up to 50% rakeback paid daily in PKC tokens.',
  },
];

const distribution = [
  { label: 'Player Rewards', percentage: 35, color: 'bg-accent-primary' },
  { label: 'Team & Dev', percentage: 20, color: 'bg-accent-purple' },
  { label: 'Public Sale', percentage: 15, color: 'bg-accent-gold' },
  { label: 'Liquidity', percentage: 15, color: 'bg-accent-blue' },
  { label: 'Marketing', percentage: 10, color: 'bg-accent-orange' },
  { label: 'Reserve', percentage: 5, color: 'bg-text-muted' },
];

export function TokenSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-gold/10 border border-accent-gold/30 mb-6">
              <Coins className="w-4 h-4 text-accent-gold" />
              <span className="text-accent-gold font-medium text-sm">PKC Token</span>
            </div>

            <h2 className="text-4xl font-display font-bold mb-6">
              The Native Currency of
              <br />
              <span className="text-gradient-gold">CryptoPoker</span>
            </h2>

            <p className="text-text-secondary text-lg mb-8">
              PokerChip (PKC) is the utility token that powers the entire CryptoPoker ecosystem. 
              Use it to play, stake, and govern the platform.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {tokenFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-text-secondary text-sm">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <Link href="/token" className="btn btn-primary">
                Buy PKC
              </Link>
              <Link href="/tokenomics" className="btn btn-secondary">
                View Tokenomics
              </Link>
            </div>
          </motion.div>

          {/* Right - Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="card">
              <h3 className="text-xl font-semibold mb-6">Token Distribution</h3>
              
              {/* Progress bars */}
              <div className="space-y-4">
                {distribution.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-mono font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        viewport={{ once: true }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Supply */}
              <div className="mt-8 pt-6 border-t border-border-primary">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Total Supply</span>
                  <span className="text-2xl font-mono font-bold text-gradient-gold">
                    1,000,000,000 PKC
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
