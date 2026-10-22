'use client';

import { motion } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign,
  Calendar,
  Star,
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

export function GuestTournamentsPreview() {
  const upcomingTournaments = [
    {
      id: 1,
      name: 'Daily Freeroll',
      type: 'Freeroll',
      buyIn: 0,
      prizePool: 10000,
      players: 156,
      maxPlayers: 500,
      startTime: '2 hours',
      featured: false,
    },
    {
      id: 2,
      name: 'Weekend Championship',
      type: 'Freezeout',
      buyIn: 1000,
      prizePool: 500000,
      players: 89,
      maxPlayers: 200,
      startTime: '5 hours',
      featured: true,
    },
    {
      id: 3,
      name: 'Bounty Hunter',
      type: 'Knockout',
      buyIn: 500,
      prizePool: 100000,
      players: 234,
      maxPlayers: 500,
      startTime: '8 hours',
      featured: false,
    },
    {
      id: 4,
      name: 'High Roller',
      type: 'Freezeout',
      buyIn: 5000,
      prizePool: 1000000,
      players: 42,
      maxPlayers: 100,
      startTime: '12 hours',
      featured: true,
    },
  ];

  const tournamentTypes = [
    { name: 'Freeroll', description: 'Free entry with real prizes', icon: Star },
    { name: 'Freezeout', description: 'No rebuys, one chance', icon: Zap },
    { name: 'Knockout', description: 'Win bounties for eliminations', icon: Trophy },
    { name: 'Sit & Go', description: 'Start when full', icon: Users },
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
          <span className="text-gradient">Tournaments</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Compete against players worldwide in exciting poker tournaments. 
          From freerolls to high roller events, there's something for everyone.
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
          { label: 'Active Tournaments', value: '24', icon: Trophy },
          { label: 'Total Prize Pool', value: '2.5M PKC', icon: DollarSign },
          { label: 'Players Online', value: '1,234', icon: Users },
          { label: 'Starting Soon', value: '8', icon: Clock },
        ].map((stat, index) => (
          <div key={index} className="card text-center">
            <stat.icon className="w-8 h-8 text-accent-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent-gold">{stat.value}</p>
            <p className="text-text-muted text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tournament Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-2xl font-bold mb-6">Tournament Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tournamentTypes.map((type, index) => (
            <div key={index} className="bg-background-tertiary rounded-xl p-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-accent-primary/20 flex items-center justify-center mb-3">
                <type.icon className="w-6 h-6 text-accent-primary" />
              </div>
              <h3 className="font-bold mb-1">{type.name}</h3>
              <p className="text-text-muted text-sm">{type.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Tournaments Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Tournaments</h2>
          <div className="flex items-center gap-2 text-text-muted">
            <Calendar className="w-5 h-5" />
            <span>Today</span>
          </div>
        </div>

        <div className="space-y-4">
          {upcomingTournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={clsx(
                'relative rounded-xl border p-4 transition-all',
                tournament.featured
                  ? 'bg-gradient-to-r from-accent-gold/10 to-transparent border-accent-gold/30'
                  : 'bg-background-tertiary border-border-primary'
              )}
            >
              {tournament.featured && (
                <div className="absolute -top-2 right-4 bg-accent-gold text-background-primary text-xs font-bold px-2 py-1 rounded">
                  FEATURED
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className={clsx(
                      'w-6 h-6',
                      tournament.featured ? 'text-accent-gold' : 'text-accent-primary'
                    )} />
                    <h3 className="font-bold text-lg">{tournament.name}</h3>
                    <span className="text-xs bg-background-hover px-2 py-1 rounded text-text-muted">
                      {tournament.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {tournament.buyIn === 0 ? 'FREE' : `${tournament.buyIn.toLocaleString()} PKC`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tournament.players}/{tournament.maxPlayers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Starts in {tournament.startTime}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-text-muted text-sm">Prize Pool</p>
                    <p className="text-xl font-bold text-accent-gold">
                      {tournament.prizePool.toLocaleString()} PKC
                    </p>
                  </div>
                  <button className="btn-secondary btn-sm flex items-center gap-2" disabled>
                    <Lock className="w-4 h-4" />
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6 p-4 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-accent-primary" />
            <div>
              <p className="font-bold">Sign in to Register</p>
              <p className="text-text-muted text-sm">Create an account to join tournaments and compete for prizes</p>
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
