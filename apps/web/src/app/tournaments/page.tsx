'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign,
  Calendar,
  ChevronRight,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { GuestTournamentsPreview } from '@/components/guest';
import { clsx } from 'clsx';

interface Tournament {
  id: string;
  name: string;
  type: 'FREEZEOUT' | 'REBUY' | 'BOUNTY' | 'SATELLITE';
  buyIn: number;
  prizePool: number;
  players: number;
  maxPlayers: number;
  startsAt: Date;
  status: 'REGISTERING' | 'RUNNING' | 'COMPLETED' | 'UPCOMING';
  blindLevel?: string;
}

const tournamentTypes = ['All', 'FREEZEOUT', 'REBUY', 'BOUNTY', 'SATELLITE'];
const statusFilters = ['All', 'REGISTERING', 'RUNNING', 'UPCOMING'];

export default function TournamentsPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredTournaments = mockTournaments.filter((t) => {
    const matchesType = selectedType === 'All' || t.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERING':
        return 'bg-accent-primary/10 text-accent-primary';
      case 'RUNNING':
        return 'bg-accent-gold/10 text-accent-gold';
      case 'UPCOMING':
        return 'bg-accent-blue/10 text-accent-blue';
      case 'COMPLETED':
        return 'bg-text-muted/10 text-text-muted';
      default:
        return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FREEZEOUT':
        return <Trophy className="w-4 h-4" />;
      case 'REBUY':
        return <Zap className="w-4 h-4" />;
      case 'BOUNTY':
        return <Crown className="w-4 h-4" />;
      case 'SATELLITE':
        return <Star className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Started';
    if (diff < 60000) return 'Starting soon';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-poker flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  // Show guest preview for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-poker flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GuestTournamentsPreview />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-gradient-poker flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-display font-bold mb-2">
              <span className="text-gradient">Tournaments</span>
            </h1>
            <p className="text-text-secondary">
              Compete against other players for massive prize pools
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-text-muted text-sm">Active Now</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.5M</p>
                <p className="text-text-muted text-sm">Prize Pools</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">856</p>
                <p className="text-text-muted text-sm">Players Competing</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-text-muted text-sm">Starting Soon</p>
              </div>
            </div>
          </div>

          {/* Featured Tournament */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card mb-8 p-0 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-accent-primary/20 to-accent-gold/20 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-accent-gold" />
                    <span className="text-accent-gold font-semibold text-sm">FEATURED TOURNAMENT</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Sunday Million</h2>
                  <p className="text-text-secondary mb-4">
                    The biggest weekly tournament with guaranteed 1,000,000 PKC prize pool
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-accent-primary" />
                      <span>Buy-in: 1,000 PKC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent-primary" />
                      <span>234/1000 registered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent-primary" />
                      <span>Starts in 2h 45m</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-text-muted text-sm mb-1">Prize Pool</p>
                  <p className="text-4xl font-bold text-gradient mb-4">1,000,000 PKC</p>
                  <button className="btn btn-primary px-8">
                    Register Now
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                {tournamentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      selectedType === type
                        ? 'bg-accent-primary text-background-primary'
                        : 'bg-background-tertiary text-text-secondary hover:bg-background-hover'
                    )}
                  >
                    {type === 'All' ? 'All Types' : type}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 ml-auto">
                {statusFilters.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      selectedStatus === status
                        ? 'bg-accent-primary text-background-primary'
                        : 'bg-background-tertiary text-text-secondary hover:bg-background-hover'
                    )}
                  >
                    {status === 'All' ? 'All Status' : status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tournaments List */}
          <div className="space-y-4">
            {filteredTournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card hover:border-accent-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                      {getTypeIcon(tournament.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{tournament.name}</h3>
                        <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(tournament.status))}>
                          {tournament.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                        <span>{tournament.type}</span>
                        <span>Buy-in: {tournament.buyIn.toLocaleString()} PKC</span>
                        <span>{tournament.players}/{tournament.maxPlayers} players</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-text-muted text-sm">Prize Pool</p>
                      <p className="text-xl font-bold text-accent-primary">
                        {tournament.prizePool.toLocaleString()} PKC
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted text-sm">
                        {tournament.status === 'RUNNING' ? 'Level' : 'Starts'}
                      </p>
                      <p className="font-semibold">
                        {tournament.status === 'RUNNING' 
                          ? tournament.blindLevel 
                          : formatTime(tournament.startsAt)}
                      </p>
                    </div>
                    <button className={clsx(
                      'btn text-sm py-2 min-w-[100px]',
                      tournament.status === 'REGISTERING' ? 'btn-primary' : 'btn-secondary'
                    )}>
                      {tournament.status === 'REGISTERING' ? 'Register' : 
                       tournament.status === 'RUNNING' ? 'Watch' : 'Details'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Mock data
const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Daily Freeroll',
    type: 'FREEZEOUT',
    buyIn: 0,
    prizePool: 10000,
    players: 156,
    maxPlayers: 500,
    startsAt: new Date(Date.now() + 30 * 60000),
    status: 'REGISTERING',
  },
  {
    id: '2',
    name: 'Bounty Hunter',
    type: 'BOUNTY',
    buyIn: 100,
    prizePool: 50000,
    players: 89,
    maxPlayers: 200,
    startsAt: new Date(Date.now() + 2 * 3600000),
    status: 'REGISTERING',
  },
  {
    id: '3',
    name: 'High Roller Championship',
    type: 'FREEZEOUT',
    buyIn: 5000,
    prizePool: 500000,
    players: 45,
    maxPlayers: 100,
    startsAt: new Date(Date.now() - 30 * 60000),
    status: 'RUNNING',
    blindLevel: '150/300',
  },
  {
    id: '4',
    name: 'Rebuy Madness',
    type: 'REBUY',
    buyIn: 50,
    prizePool: 25000,
    players: 234,
    maxPlayers: 500,
    startsAt: new Date(Date.now() - 60 * 60000),
    status: 'RUNNING',
    blindLevel: '100/200',
  },
  {
    id: '5',
    name: 'Sunday Million Satellite',
    type: 'SATELLITE',
    buyIn: 100,
    prizePool: 0,
    players: 67,
    maxPlayers: 200,
    startsAt: new Date(Date.now() + 5 * 3600000),
    status: 'UPCOMING',
  },
  {
    id: '6',
    name: 'Night Owl Tournament',
    type: 'FREEZEOUT',
    buyIn: 200,
    prizePool: 100000,
    players: 0,
    maxPlayers: 300,
    startsAt: new Date(Date.now() + 8 * 3600000),
    status: 'UPCOMING',
  },
];
