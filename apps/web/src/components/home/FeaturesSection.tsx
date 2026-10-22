'use client';

import { motion } from 'framer-motion';
import { 
  Spade, 
  Shield, 
  Coins, 
  Trophy, 
  Wallet, 
  Users 
} from 'lucide-react';

const features = [
  {
    icon: Spade,
    title: 'Texas Hold\'em',
    description: 'Classic poker gameplay with multiple stake levels from micro to high roller tables.',
    color: 'bg-accent-primary/10 text-accent-primary',
  },
  {
    icon: Shield,
    title: 'Provably Fair',
    description: 'All hands are verifiable on-chain. Complete transparency with cryptographic proof.',
    color: 'bg-accent-blue/10 text-accent-blue',
  },
  {
    icon: Coins,
    title: 'PKC Token',
    description: 'Native utility token for gameplay, staking, and governance. Earn rewards on every hand.',
    color: 'bg-accent-gold/10 text-accent-gold',
  },
  {
    icon: Trophy,
    title: 'Tournaments',
    description: 'Daily freerolls, Sit & Go\'s, and multi-table tournaments with massive prize pools.',
    color: 'bg-accent-purple/10 text-accent-purple',
  },
  {
    icon: Wallet,
    title: 'Instant Payouts',
    description: 'Withdraw your winnings instantly to your Web3 wallet. No waiting periods.',
    color: 'bg-accent-orange/10 text-accent-orange',
  },
  {
    icon: Users,
    title: 'VIP Program',
    description: 'Level up from Bronze to Diamond. Unlock exclusive rewards, rakeback, and perks.',
    color: 'bg-accent-primary/10 text-accent-primary',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-display font-bold mb-4">
            Why Play on <span className="text-gradient">CryptoPoker</span>?
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            The most advanced crypto poker platform with unique features designed for both casual and professional players.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-hover group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
