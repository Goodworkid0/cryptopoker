'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown,
  Spade,
  Play,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { tablesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { GuestLobbiesPreview } from '@/components/guest';
import { clsx } from 'clsx';

interface Table {
  id: string;
  name: string;
  type: string;
  smallBlind: string;
  bigBlind: string;
  minBuyIn: string;
  maxBuyIn: string;
  maxPlayers: number;
  currentPlayers: number;
  status: string;
}

const gameTypes = ['All', 'TEXAS_HOLDEM', 'OMAHA'];
const stakes = ['All Stakes', 'Micro', 'Low', 'Medium', 'High'];

export default function LobbiesPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStakes, setSelectedStakes] = useState('All Stakes');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const { data } = await tablesApi.getAll();
      setTables(data);
    } catch (error) {
      // Use mock data if API fails
      setTables(mockTables);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || table.type === selectedType;
    return matchesSearch && matchesType;
  });

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
            <GuestLobbiesPreview />
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
              Poker <span className="text-gradient">Lobby</span>
            </h1>
            <p className="text-text-secondary">
              Choose a table and start playing. New tables open every minute.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-text-muted text-sm">Players Online</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                <Spade className="w-6 h-6 text-accent-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tables.length}</p>
                <p className="text-text-muted text-sm">Active Tables</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">5.2M</p>
                <p className="text-text-muted text-sm">PKC in Play</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-text-muted text-sm">Games Running</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  className="input pl-12"
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Game Type */}
              <div className="relative">
                <select
                  className="input pr-10 appearance-none cursor-pointer min-w-[180px]"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {gameTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'All' ? 'All Games' : type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>

              {/* Stakes */}
              <div className="relative">
                <select
                  className="input pr-10 appearance-none cursor-pointer min-w-[150px]"
                  value={selectedStakes}
                  onChange={(e) => setSelectedStakes(e.target.value)}
                >
                  {stakes.map((stake) => (
                    <option key={stake} value={stake}>
                      {stake}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tables List */}
          <div className="card overflow-hidden p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-background-tertiary border-b border-border-primary text-sm font-medium text-text-muted">
              <div className="col-span-4">Table Name</div>
              <div className="col-span-2">Stakes</div>
              <div className="col-span-2">Buy-in</div>
              <div className="col-span-2">Players</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Table Rows */}
            {loading ? (
              <div className="px-6 py-12 text-center text-text-muted">
                Loading tables...
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="px-6 py-12 text-center text-text-muted">
                No tables found matching your criteria.
              </div>
            ) : (
              <div className="divide-y divide-border-primary">
                {filteredTables.map((table, index) => (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-background-hover transition-colors"
                  >
                    {/* Name */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                          <Spade className="w-5 h-5 text-accent-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{table.name}</p>
                          <p className="text-xs text-text-muted">
                            {table.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stakes */}
                    <div className="col-span-2">
                      <span className="text-accent-primary font-mono font-semibold">
                        {table.smallBlind}/{table.bigBlind}
                      </span>
                    </div>

                    {/* Buy-in */}
                    <div className="col-span-2 text-text-secondary">
                      {Number(table.minBuyIn).toLocaleString()} - {Number(table.maxBuyIn).toLocaleString()}
                    </div>

                    {/* Players */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(table.maxPlayers)].map((_, i) => (
                            <div
                              key={i}
                              className={clsx(
                                'w-2 h-2 rounded-full',
                                i < table.currentPlayers
                                  ? 'bg-accent-primary'
                                  : 'bg-background-tertiary'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-text-secondary text-sm">
                          {table.currentPlayers}/{table.maxPlayers}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="col-span-2 text-right">
                      <Link
                        href={`/table/${table.id}`}
                        className="btn btn-primary text-sm py-2"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Mock data
const mockTables: Table[] = [
  {
    id: '1',
    name: "Beginner's Paradise",
    type: 'TEXAS_HOLDEM',
    smallBlind: '1',
    bigBlind: '2',
    minBuyIn: '40',
    maxBuyIn: '200',
    maxPlayers: 9,
    currentPlayers: 6,
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Diamond Room',
    type: 'TEXAS_HOLDEM',
    smallBlind: '25',
    bigBlind: '50',
    minBuyIn: '1000',
    maxBuyIn: '5000',
    maxPlayers: 6,
    currentPlayers: 4,
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'High Roller',
    type: 'TEXAS_HOLDEM',
    smallBlind: '100',
    bigBlind: '200',
    minBuyIn: '4000',
    maxBuyIn: '20000',
    maxPlayers: 6,
    currentPlayers: 3,
    status: 'ACTIVE',
  },
  {
    id: '4',
    name: 'Micro Stakes',
    type: 'TEXAS_HOLDEM',
    smallBlind: '0.1',
    bigBlind: '0.2',
    minBuyIn: '4',
    maxBuyIn: '20',
    maxPlayers: 9,
    currentPlayers: 8,
    status: 'ACTIVE',
  },
  {
    id: '5',
    name: 'Omaha Action',
    type: 'OMAHA',
    smallBlind: '5',
    bigBlind: '10',
    minBuyIn: '200',
    maxBuyIn: '1000',
    maxPlayers: 6,
    currentPlayers: 5,
    status: 'ACTIVE',
  },
  {
    id: '6',
    name: 'VIP Lounge',
    type: 'TEXAS_HOLDEM',
    smallBlind: '50',
    bigBlind: '100',
    minBuyIn: '2000',
    maxBuyIn: '10000',
    maxPlayers: 6,
    currentPlayers: 2,
    status: 'ACTIVE',
  },
];
