'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Wallet, 
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Edit3,
  Camera,
  Shield,
  Crown,
  Star,
  Zap,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  // Redirect handled by AuthProvider for unauthenticated users

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

  if (!isAuthenticated || !user) {
    return null; // Will redirect via AuthProvider
  }

  const stats = {
    handsPlayed: 12456,
    handsWon: 4521,
    winRate: 36.3,
    biggestPot: 125000,
    tournamentsPlayed: 89,
    tournamentsWon: 12,
    totalEarnings: 2450000,
    currentStreak: 5,
  };

  const recentAchievements = [
    { id: 1, name: 'High Roller', icon: '💎', date: '2 days ago' },
    { id: 2, name: 'Tournament Champion', icon: '👑', date: '5 days ago' },
    { id: 3, name: 'Shark', icon: '🦈', date: '1 week ago' },
  ];

  const copyWalletAddress = () => {
    if (user.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getVipColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'diamond': return 'text-accent-blue';
      case 'platinum': return 'text-purple-400';
      case 'gold': return 'text-accent-gold';
      case 'silver': return 'text-gray-400';
      default: return 'text-amber-600';
    }
  };

  const experienceProgress = ((user.experience || 0) % 1000) / 10;

  return (
    <div className="min-h-screen bg-gradient-poker flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-accent flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-background-primary" />
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center hover:bg-accent-secondary transition-colors">
                  <Camera className="w-5 h-5 text-background-primary" />
                </button>
                <div className={clsx(
                  'absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center',
                  user.vipTier === 'Diamond' ? 'bg-accent-blue' :
                  user.vipTier === 'Platinum' ? 'bg-purple-500' :
                  user.vipTier === 'Gold' ? 'bg-accent-gold' :
                  user.vipTier === 'Silver' ? 'bg-gray-400' : 'bg-amber-600'
                )}>
                  <Crown className="w-4 h-4 text-background-primary" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-display font-bold mb-1">{user.username}</h1>
                    <div className="flex items-center gap-4 text-text-secondary">
                      {user.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </span>
                      )}
                      <span className={clsx('flex items-center gap-1 font-medium', getVipColor(user.vipTier))}>
                        <Crown className="w-4 h-4" />
                        {user.vipTier} VIP
                      </span>
                    </div>
                  </div>
                  <Link href="/settings" className="btn-secondary btn-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </Link>
                </div>

                {/* Level Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Level {user.level}</span>
                    <span className="text-sm text-text-muted">{user.experience} / {(user.level + 1) * 1000} XP</span>
                  </div>
                  <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${experienceProgress}%` }}
                      className="h-full bg-gradient-accent"
                    />
                  </div>
                </div>

                {/* Wallet Address */}
                {user.walletAddress && (
                  <div className="flex items-center gap-2 p-3 bg-background-tertiary rounded-lg">
                    <Wallet className="w-5 h-5 text-accent-primary" />
                    <span className="font-mono text-sm text-text-secondary truncate flex-1">
                      {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                    </span>
                    <button
                      onClick={copyWalletAddress}
                      className="p-2 hover:bg-background-hover rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-accent-primary" />
                      ) : (
                        <Copy className="w-4 h-4 text-text-muted" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Hands Played', value: stats.handsPlayed.toLocaleString(), icon: Target, color: 'text-accent-primary' },
              { label: 'Win Rate', value: `${stats.winRate}%`, icon: TrendingUp, color: 'text-accent-primary' },
              { label: 'Tournaments Won', value: stats.tournamentsWon, icon: Trophy, color: 'text-accent-gold' },
              { label: 'Total Earnings', value: `${(stats.totalEarnings / 1000).toFixed(0)}K PKC`, icon: Zap, color: 'text-accent-gold' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={clsx('w-5 h-5', stat.color)} />
                  <span className="text-text-muted text-sm">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Detailed Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-primary" />
                Detailed Statistics
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Hands Won', value: stats.handsWon.toLocaleString() },
                  { label: 'Biggest Pot', value: `${stats.biggestPot.toLocaleString()} PKC` },
                  { label: 'Tournaments Played', value: stats.tournamentsPlayed },
                  { label: 'Current Win Streak', value: `${stats.currentStreak} games` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border-primary last:border-0">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent-gold" />
                  Recent Achievements
                </h2>
                <Link href="/rewards" className="text-accent-primary text-sm hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4 p-3 bg-background-tertiary rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-accent-gold/20 flex items-center justify-center text-2xl">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-text-muted text-sm">{achievement.date}</p>
                    </div>
                    <Shield className="w-5 h-5 text-accent-gold" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Wallet', href: '/wallet', icon: Wallet, color: 'bg-accent-primary/10 text-accent-primary' },
              { label: 'Settings', href: '/settings', icon: Edit3, color: 'bg-purple-500/10 text-purple-400' },
              { label: 'Rewards', href: '/rewards', icon: Trophy, color: 'bg-accent-gold/10 text-accent-gold' },
              { label: 'Leaderboard', href: '/leaderboard', icon: Crown, color: 'bg-accent-blue/10 text-accent-blue' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="card hover:border-accent-primary/30 transition-colors flex items-center gap-4"
              >
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">{action.label}</p>
                  <p className="text-text-muted text-sm">Manage</p>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
