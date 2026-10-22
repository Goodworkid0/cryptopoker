'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';

const mockTables = [
  {
    id: '1',
    name: 'Beginner\'s Paradise',
    stakes: '1/2 PKC',
    players: 6,
    maxPlayers: 9,
    type: 'No Limit',
  },
  {
    id: '2',
    name: 'Diamond Room',
    stakes: '25/50 PKC',
    players: 4,
    maxPlayers: 6,
    type: 'No Limit',
    hot: true,
  },
  {
    id: '3',
    name: 'High Roller',
    stakes: '100/200 PKC',
    players: 3,
    maxPlayers: 6,
    type: 'No Limit',
    vip: true,
  },
  {
    id: '4',
    name: 'Turbo Tables',
    stakes: '5/10 PKC',
    players: 8,
    maxPlayers: 9,
    type: 'No Limit',
  },
  {
    id: '5',
    name: 'Micro Stakes',
    stakes: '0.1/0.2 PKC',
    players: 7,
    maxPlayers: 9,
    type: 'No Limit',
  },
  {
    id: '6',
    name: 'VIP Lounge',
    stakes: '50/100 PKC',
    players: 2,
    maxPlayers: 6,
    type: 'Pot Limit',
    vip: true,
  },
];

export function TablesPreview() {
  return (
    <section className="py-24 bg-background-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-4xl font-display font-bold mb-4">
              Live <span className="text-gradient">Tables</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Jump into a game now. Tables for every skill level and bankroll.
            </p>
          </div>
          <Link
            href="/poker"
            className="hidden md:flex items-center gap-2 text-accent-primary hover:underline"
          >
            View All Tables
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link href={`/poker/${table.id}`} className="block">
                <div className="card-hover group relative overflow-hidden">
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {table.hot && (
                      <span className="badge bg-accent-orange/20 text-accent-orange">
                        🔥 Hot
                      </span>
                    )}
                    {table.vip && (
                      <span className="badge-gold">
                        👑 VIP
                      </span>
                    )}
                  </div>

                  {/* Table Info */}
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-accent-primary transition-colors">
                    {table.name}
                  </h3>
                  <p className="text-2xl font-mono font-bold text-accent-primary mb-4">
                    {table.stakes}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Users className="w-4 h-4" />
                      <span>
                        {table.players}/{table.maxPlayers}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-background-tertiary text-text-muted">
                      {table.type}
                    </span>
                  </div>

                  {/* Player indicator */}
                  <div className="mt-4 flex gap-1">
                    {[...Array(table.maxPlayers)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < table.players
                            ? 'bg-accent-primary'
                            : 'bg-background-tertiary'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/poker" className="btn btn-secondary">
            View All Tables
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
