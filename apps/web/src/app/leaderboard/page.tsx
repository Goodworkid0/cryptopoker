'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown,
  TrendingUp,
  DollarSign,
  Flame,
  ChevronDown,
  User
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { clsx } from 'clsx';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar?: string;
  value: number;
  change: number; // rank change from yesterday
  vipLevel: string;
}

type LeaderboardType = 'earnings' | 'tournaments' | 'hands' | 'streak';
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'allTime';

export default function LeaderboardPage() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('earnings');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');

  const leaderboardData: Record<LeaderboardType, LeaderboardEntry[]> = {
    earnings: [
      { rank: 1, username: 'CryptoKing', value: 2450000, change: 0, vipLevel: 'Diamond' },
      { rank: 2, username: 'PokerPro99', value: 1890000, change: 2, vipLevel: 'Diamond' },
      { rank: 3, username: 'AceHunter', value: 1650000, change: -1, vipLevel: 'Platinum' },
      { rank: 4, username: 'BluffMaster', value: 1420000, change: 1, vipLevel: 'Platinum' },
      { rank: 5, username: 'ChipStacker', value: 1280000, change: -2, vipLevel: 'Gold' },
      { rank: 6, username: 'RiverRat', value: 1150000, change: 3, vipLevel: 'Gold' },
      { rank: 7, username: 'NightOwl', value: 980000, change: 0, vipLevel: 'Gold' },
      { rank: 8, username: 'LuckyDraw', value: 870000, change: -1, vipLevel: 'Silver' },
      { rank: 9, username: 'SharkAttack', value: 750000, change: 2, vipLevel: 'Silver' },
      { rank: 10, username: 'CardCounter', value: 680000, change: -1, vipLevel: 'Silver' },
    ],
    tournaments: [
      { rank: 1, username: 'TourneyKing', value: 45, change: 1, vipLevel: 'Diamond' },
      { rank: 2, username: 'FinalTable', value: 38, change: -1, vipLevel: 'Platinum' },
      { rank: 3, username: 'BubbleBoy', value: 32, change: 0, vipLevel: 'Gold' },
      { rank: 4, username: 'ICMaster', value: 28, change: 3, vipLevel: 'Platinum' },
      { rank: 5, username: 'StackBuilder', value: 25, change: -1, vipLevel: 'Gold' },
      { rank: 6, username: 'AllInAlways', value: 22, change: 0, vipLevel: 'Silver' },
      { rank: 7, username: 'PatientPro', value: 19, change: 2, vipLevel: 'Silver' },
      { rank: 8, username: 'AggroPlayer', value: 17, change: -2, vipLevel: 'Bronze' },
      { rank: 9, username: 'TightIsRight', value: 15, change: 1, vipLevel: 'Silver' },
      { rank: 10, username: 'PushFold', value: 13, change: -1, vipLevel: 'Bronze' },
    ],
    hands: [
      { rank: 1, username: 'Grinder24/7', value: 45000, change: 0, vipLevel: 'Diamond' },
      { rank: 2, username: 'VolumeKing', value: 38000, change: 1, vipLevel: 'Diamond' },
      { rank: 3, username: 'NeverSleep', value: 32000, change: -1, vipLevel: 'Platinum' },
      { rank: 4, username: 'MultiTable', value: 28500, change: 2, vipLevel: 'Platinum' },
      { rank: 5, username: 'FastFold', value: 25000, change: 0, vipLevel: 'Gold' },
      { rank: 6, username: 'TableHopper', value: 22000, change: -2, vipLevel: 'Gold' },
      { rank: 7, username: 'ClickClick', value: 19500, change: 1, vipLevel: 'Silver' },
      { rank: 8, username: 'SpeedRun', value: 17000, change: 3, vipLevel: 'Silver' },
      { rank: 9, username: 'NoBreaks', value: 15000, change: -2, vipLevel: 'Silver' },
      { rank: 10, username: 'QuantumPlay', value: 13500, change: 0, vipLevel: 'Bronze' },
    ],
    streak: [
      { rank: 1, username: 'UnstoppableForce', value: 28, change: 0, vipLevel: 'Platinum' },
      { rank: 2, username: 'HotHand', value: 22, change: 1, vipLevel: 'Gold' },
      { rank: 3, username: 'OnFire', value: 18, change: 2, vipLevel: 'Gold' },
      { rank: 4, username: 'WinningWays', value: 15, change: -2, vipLevel: 'Silver' },
      { rank: 5, username: 'Momentum', value: 13, change: -1, vipLevel: 'Silver' },
      { rank: 6, username: 'RollingHigh', value: 11, change: 3, vipLevel: 'Bronze' },
      { rank: 7, username: 'ConsistentKing', value: 10, change: 0, vipLevel: 'Silver' },
      { rank: 8, username: 'DailyWinner', value: 9, change: 1, vipLevel: 'Bronze' },
      { rank: 9, username: 'StreakSeeker', value: 8, change: -2, vipLevel: 'Bronze' },
      { rank: 10, username: 'LuckyCharm', value: 7, change: -1, vipLevel: 'Bronze' },
    ],
  };

  const getValueLabel = (type: LeaderboardType) => {
    switch (type) {
      case 'earnings': return 'PKC';
      case 'tournaments': return 'Wins';
      case 'hands': return 'Hands';
      case 'streak': return 'Days';
    }
  };

  const formatValue = (value: number, type: LeaderboardType) => {
    if (type === 'earnings') {
      return value.toLocaleString();
    }
    return value.toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-accent-gold" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-text-muted">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-accent-gold/20 to-transparent border-l-4 border-accent-gold';
      case 2:
        return 'bg-gradient-to-r from-gray-400/10 to-transparent border-l-4 border-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-600/10 to-transparent border-l-4 border-amber-600';
      default:
        return 'bg-background-tertiary';
    }
  };

  const getVipColor = (level: string) => {
    switch (level) {
      case 'Diamond': return 'text-accent-blue';
      case 'Platinum': return 'text-purple-400';
      case 'Gold': return 'text-accent-gold';
      case 'Silver': return 'text-gray-400';
      default: return 'text-amber-600';
    }
  };

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
              <span className="text-gradient">Leaderboard</span>
            </h1>
            <p className="text-text-secondary">
              See who's dominating the tables and climb the ranks
            </p>
          </motion.div>

          {/* Top 3 Players */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {leaderboardData[leaderboardType].slice(0, 3).map((entry, index) => {
              const positions = [1, 0, 2]; // Display order: 2nd, 1st, 3rd
              const player = leaderboardData[leaderboardType][positions[index]];
              const isFirst = positions[index] === 0;
              
              return (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={clsx(
                    'card text-center',
                    isFirst && 'md:-mt-4 border-accent-gold/50'
                  )}
                >
                  <div className="relative inline-block mb-4">
                    <div className={clsx(
                      'w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center mx-auto',
                      isFirst && 'w-24 h-24'
                    )}>
                      <User className={clsx('text-background-primary', isFirst ? 'w-12 h-12' : 'w-10 h-10')} />
                    </div>
                    <div className={clsx(
                      'absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center',
                      player.rank === 1 ? 'bg-accent-gold' : player.rank === 2 ? 'bg-gray-400' : 'bg-amber-600'
                    )}>
                      <span className="font-bold text-background-primary">{player.rank}</span>
                    </div>
                  </div>
                  <h3 className={clsx('font-bold', isFirst ? 'text-xl' : 'text-lg')}>{player.username}</h3>
                  <p className={clsx('text-sm font-medium', getVipColor(player.vipLevel))}>{player.vipLevel}</p>
                  <p className={clsx(
                    'font-bold mt-2',
                    isFirst ? 'text-3xl text-accent-gold' : 'text-2xl text-accent-primary'
                  )}>
                    {formatValue(player.value, leaderboardType)}
                  </p>
                  <p className="text-text-muted text-sm">{getValueLabel(leaderboardType)}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'earnings', label: 'Top Earners', icon: DollarSign },
                  { id: 'tournaments', label: 'Tournament Wins', icon: Trophy },
                  { id: 'hands', label: 'Hands Played', icon: TrendingUp },
                  { id: 'streak', label: 'Win Streak', icon: Flame },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setLeaderboardType(type.id as LeaderboardType)}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      leaderboardType === type.id
                        ? 'bg-accent-primary text-background-primary'
                        : 'bg-background-tertiary text-text-secondary hover:bg-background-hover'
                    )}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <select
                  className="input pr-10 appearance-none cursor-pointer min-w-[150px]"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
                >
                  <option value="daily">Today</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="allTime">All Time</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="card overflow-hidden p-0">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-background-tertiary border-b border-border-primary text-sm font-medium text-text-muted">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2">VIP Level</div>
              <div className="col-span-2 text-right">{getValueLabel(leaderboardType)}</div>
              <div className="col-span-2 text-right">Change</div>
            </div>

            <div className="divide-y divide-border-primary">
              {leaderboardData[leaderboardType].map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={clsx(
                    'grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors',
                    getRankStyle(entry.rank)
                  )}
                >
                  <div className="col-span-1">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="col-span-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                        <User className="w-5 h-5 text-background-primary" />
                      </div>
                      <span className="font-medium">{entry.username}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={clsx('font-medium', getVipColor(entry.vipLevel))}>
                      {entry.vipLevel}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-bold text-accent-primary">
                      {formatValue(entry.value, leaderboardType)}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    {entry.change === 0 ? (
                      <span className="text-text-muted">-</span>
                    ) : entry.change > 0 ? (
                      <span className="text-green-400 flex items-center justify-end gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +{entry.change}
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center justify-end gap-1">
                        <TrendingUp className="w-4 h-4 rotate-180" />
                        {entry.change}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Your Position */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mt-6 border-accent-primary/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-background-primary" />
                </div>
                <div>
                  <p className="font-medium">Your Position</p>
                  <p className="text-text-muted text-sm">Keep playing to climb the ranks!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">#156</p>
                <p className="text-accent-primary text-sm">+12 from yesterday</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
