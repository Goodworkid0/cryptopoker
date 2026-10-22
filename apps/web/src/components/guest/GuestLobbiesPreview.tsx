'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign,
  Eye,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

export function GuestLobbiesPreview() {
  const tables = [
    {
      id: 1,
      name: 'Beginner\'s Table',
      type: 'No Limit Hold\'em',
      stakes: '10/20',
      players: 4,
      maxPlayers: 6,
      minBuyIn: 200,
      maxBuyIn: 2000,
      hot: false,
    },
    {
      id: 2,
      name: 'Mid Stakes',
      type: 'No Limit Hold\'em',
      stakes: '50/100',
      players: 6,
      maxPlayers: 9,
      minBuyIn: 1000,
      maxBuyIn: 10000,
      hot: true,
    },
    {
      id: 3,
      name: 'High Rollers',
      type: 'No Limit Hold\'em',
      stakes: '500/1000',
      players: 3,
      maxPlayers: 6,
      minBuyIn: 10000,
      maxBuyIn: 100000,
      hot: false,
    },
    {
      id: 4,
      name: 'The Shark Tank',
      type: 'Pot Limit Omaha',
      stakes: '100/200',
      players: 5,
      maxPlayers: 6,
      minBuyIn: 2000,
      maxBuyIn: 20000,
      hot: true,
    },
    {
      id: 5,
      name: 'Quick Fold',
      type: 'Zoom Poker',
      stakes: '25/50',
      players: 156,
      maxPlayers: 500,
      minBuyIn: 500,
      maxBuyIn: 5000,
      hot: true,
    },
    {
      id: 6,
      name: 'Heads Up Battle',
      type: 'No Limit Hold\'em',
      stakes: '200/400',
      players: 1,
      maxPlayers: 2,
      minBuyIn: 4000,
      maxBuyIn: 40000,
      hot: false,
    },
  ];

  const gameTypes = [
    { name: 'Texas Hold\'em', description: 'The most popular poker variant', players: 1234 },
    { name: 'Pot Limit Omaha', description: '4 hole cards, more action', players: 456 },
    { name: 'Zoom Poker', description: 'Fast-fold poker action', players: 789 },
    { name: 'Heads Up', description: '1v1 poker battles', players: 123 },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          <span className="text-gradient">Cash Games</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Join thousands of players at our poker tables. From micro stakes to high rollers, 
          find the perfect game for your bankroll.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Active Tables', value: '156', icon: Sparkles },
          { label: 'Players Online', value: '2,847', icon: Users },
          { label: 'Hands/Hour', value: '12,450', icon: Zap },
          { label: 'Total Pot Today', value: '5.2M PKC', icon: TrendingUp },
        ].map((stat, index) => (
          <div key={index} className="card text-center">
            <stat.icon className="w-8 h-8 text-accent-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent-gold">{stat.value}</p>
            <p className="text-text-muted text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Game Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-2xl font-bold mb-6">Game Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gameTypes.map((game, index) => (
            <div key={index} className="bg-background-tertiary rounded-xl p-4">
              <h3 className="font-bold mb-1">{game.name}</h3>
              <p className="text-text-muted text-sm mb-2">{game.description}</p>
              <div className="flex items-center gap-1 text-accent-primary text-sm">
                <Users className="w-4 h-4" />
                <span>{game.players} playing</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tables Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Available Tables</h2>
          <div className="flex items-center gap-2 text-accent-primary">
            <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            <span className="text-sm">Live</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm text-text-muted border-b border-border-primary mb-2">
          <div className="col-span-3">Table</div>
          <div className="col-span-2">Game</div>
          <div className="col-span-2">Stakes</div>
          <div className="col-span-2">Players</div>
          <div className="col-span-2">Buy-in</div>
          <div className="col-span-1"></div>
        </div>

        <div className="space-y-2">
          {tables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className={clsx(
                'grid grid-cols-12 gap-4 p-4 rounded-xl items-center transition-all',
                table.hot
                  ? 'bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20'
                  : 'bg-background-tertiary hover:bg-background-hover'
              )}
            >
              <div className="col-span-12 md:col-span-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{table.name}</span>
                  {table.hot && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                      🔥 HOT
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-6 md:col-span-2 text-text-secondary text-sm">
                {table.type}
              </div>
              <div className="col-span-6 md:col-span-2">
                <span className="font-mono text-accent-gold">{table.stakes}</span>
              </div>
              <div className="col-span-6 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-muted" />
                  <span className={clsx(
                    table.players >= table.maxPlayers - 1 ? 'text-red-400' : 'text-text-primary'
                  )}>
                    {table.players}/{table.maxPlayers}
                  </span>
                </div>
              </div>
              <div className="col-span-6 md:col-span-2 text-sm text-text-secondary">
                {table.minBuyIn.toLocaleString()} - {table.maxBuyIn.toLocaleString()}
              </div>
              <div className="col-span-12 md:col-span-1 flex gap-2">
                <button className="btn-secondary btn-sm flex-1 md:flex-none" disabled>
                  <Eye className="w-4 h-4" />
                </button>
                <button className="btn-primary btn-sm flex-1 md:flex-none flex items-center gap-1" disabled>
                  <Lock className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6 p-4 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-accent-primary" />
            <div>
              <p className="font-bold">Sign in to Play</p>
              <p className="text-text-muted text-sm">Create an account to join tables and start playing</p>
            </div>
          </div>
          <Link href="/register" className="btn-primary flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
