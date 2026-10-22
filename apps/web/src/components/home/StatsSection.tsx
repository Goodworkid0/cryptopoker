'use client';

import { motion } from 'framer-motion';
import { Users, DollarSign, Trophy, Zap } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Players',
    color: 'text-accent-primary',
  },
  {
    icon: DollarSign,
    value: '$2.5M+',
    label: 'Total Payouts',
    color: 'text-accent-gold',
  },
  {
    icon: Trophy,
    value: '10,000+',
    label: 'Tournaments',
    color: 'text-accent-purple',
  },
  {
    icon: Zap,
    value: '<2s',
    label: 'Avg. Transaction',
    color: 'text-accent-blue',
  },
];

export function StatsSection() {
  return (
    <section className="py-16 border-y border-border-primary bg-background-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-background-tertiary mb-4 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-display font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-text-secondary text-sm">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
