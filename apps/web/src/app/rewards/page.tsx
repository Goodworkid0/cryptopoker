'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Zap, 
  Trophy,
  Clock,
  CheckCircle,
  Lock,
  ChevronRight,
  Sparkles,
  Target,
  Calendar
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { GuestRewardsPreview } from '@/components/guest';
import { clsx } from 'clsx';

interface DailyReward {
  day: number;
  reward: number;
  claimed: boolean;
  current: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  reward: number;
  completed: boolean;
}

interface Mission {
  id: string;
  name: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: number;
  type: 'DAILY' | 'WEEKLY';
  expiresAt: Date;
}

export default function RewardsPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'missions' | 'achievements' | 'vip'>('daily');

  const dailyRewards: DailyReward[] = [
    { day: 1, reward: 100, claimed: true, current: false },
    { day: 2, reward: 150, claimed: true, current: false },
    { day: 3, reward: 200, claimed: true, current: false },
    { day: 4, reward: 300, claimed: false, current: true },
    { day: 5, reward: 500, claimed: false, current: false },
    { day: 6, reward: 750, claimed: false, current: false },
    { day: 7, reward: 1500, claimed: false, current: false },
  ];

  const missions: Mission[] = [
    {
      id: '1',
      name: 'Win 3 Hands',
      description: 'Win 3 hands in cash games',
      progress: 2,
      maxProgress: 3,
      reward: 50,
      type: 'DAILY',
      expiresAt: new Date(Date.now() + 8 * 3600000),
    },
    {
      id: '2',
      name: 'Play 10 Hands',
      description: 'Play 10 hands in any game mode',
      progress: 7,
      maxProgress: 10,
      reward: 30,
      type: 'DAILY',
      expiresAt: new Date(Date.now() + 8 * 3600000),
    },
    {
      id: '3',
      name: 'Win a Tournament',
      description: 'Finish 1st place in any tournament',
      progress: 0,
      maxProgress: 1,
      reward: 500,
      type: 'WEEKLY',
      expiresAt: new Date(Date.now() + 5 * 24 * 3600000),
    },
    {
      id: '4',
      name: 'Collect 5 Bounties',
      description: 'Eliminate 5 players in bounty tournaments',
      progress: 3,
      maxProgress: 5,
      reward: 200,
      type: 'WEEKLY',
      expiresAt: new Date(Date.now() + 5 * 24 * 3600000),
    },
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Blood',
      description: 'Win your first hand',
      icon: '🎯',
      progress: 1,
      maxProgress: 1,
      reward: 100,
      completed: true,
    },
    {
      id: '2',
      name: 'Shark',
      description: 'Win 100 hands',
      icon: '🦈',
      progress: 67,
      maxProgress: 100,
      reward: 1000,
      completed: false,
    },
    {
      id: '3',
      name: 'High Roller',
      description: 'Win a pot over 10,000 PKC',
      icon: '💎',
      progress: 0,
      maxProgress: 1,
      reward: 500,
      completed: false,
    },
    {
      id: '4',
      name: 'Tournament Champion',
      description: 'Win 10 tournaments',
      icon: '🏆',
      progress: 3,
      maxProgress: 10,
      reward: 5000,
      completed: false,
    },
    {
      id: '5',
      name: 'Royal Flush',
      description: 'Hit a Royal Flush',
      icon: '👑',
      progress: 0,
      maxProgress: 1,
      reward: 10000,
      completed: false,
    },
    {
      id: '6',
      name: 'Grinder',
      description: 'Play 1000 hands',
      icon: '⚡',
      progress: 456,
      maxProgress: 1000,
      reward: 2500,
      completed: false,
    },
  ];

  const vipLevels = [
    { level: 1, name: 'Bronze', points: 0, rakeback: 5 },
    { level: 2, name: 'Silver', points: 1000, rakeback: 10 },
    { level: 3, name: 'Gold', points: 5000, rakeback: 15 },
    { level: 4, name: 'Platinum', points: 25000, rakeback: 20 },
    { level: 5, name: 'Diamond', points: 100000, rakeback: 30 },
  ];

  const currentVipPoints = 3500;
  const currentLevel = vipLevels.find((l, i) => 
    currentVipPoints >= l.points && (i === vipLevels.length - 1 || currentVipPoints < vipLevels[i + 1].points)
  ) || vipLevels[0];

  const nextLevel = vipLevels[vipLevels.indexOf(currentLevel) + 1];

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
            <GuestRewardsPreview />
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
              <span className="text-gradient">Rewards</span>
            </h1>
            <p className="text-text-secondary">
              Earn rewards for playing and completing challenges
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'daily', label: 'Daily Bonus', icon: Calendar },
              { id: 'missions', label: 'Missions', icon: Target },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'vip', label: 'VIP Program', icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={clsx(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-accent-primary text-background-primary'
                    : 'bg-background-card text-text-secondary hover:bg-background-hover'
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Daily Bonus */}
          {activeTab === 'daily' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Daily Login Bonus</h2>
                    <p className="text-text-secondary">Login every day to claim increasing rewards</p>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {dailyRewards.map((day) => (
                    <div
                      key={day.day}
                      className={clsx(
                        'relative p-4 rounded-xl text-center transition-all',
                        day.claimed 
                          ? 'bg-accent-primary/10 border border-accent-primary/30' 
                          : day.current 
                            ? 'bg-accent-gold/10 border-2 border-accent-gold animate-pulse'
                            : 'bg-background-tertiary border border-border-secondary'
                      )}
                    >
                      {day.claimed && (
                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-accent-primary" />
                      )}
                      {!day.claimed && !day.current && (
                        <Lock className="absolute top-2 right-2 w-4 h-4 text-text-muted" />
                      )}
                      <p className="text-text-muted text-xs mb-1">Day {day.day}</p>
                      <div className="w-10 h-10 mx-auto rounded-full bg-accent-gold/20 flex items-center justify-center mb-2">
                        <Gift className={clsx(
                          'w-5 h-5',
                          day.claimed ? 'text-accent-primary' : 'text-accent-gold'
                        )} />
                      </div>
                      <p className={clsx(
                        'font-bold',
                        day.claimed ? 'text-text-muted' : 'text-accent-primary'
                      )}>
                        {day.reward}
                      </p>
                      <p className="text-xs text-text-muted">PKC</p>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary w-full mt-6" disabled={!dailyRewards.find(d => d.current)}>
                  <Gift className="w-5 h-5" />
                  Claim Day 4 Reward
                </button>
              </div>
            </motion.div>
          )}

          {/* Missions */}
          {activeTab === 'missions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Daily Missions */}
                <div className="card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Daily Missions</h3>
                      <p className="text-text-muted text-sm">Resets in 8 hours</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {missions.filter(m => m.type === 'DAILY').map((mission) => (
                      <div key={mission.id} className="p-4 rounded-xl bg-background-tertiary">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{mission.name}</p>
                            <p className="text-text-muted text-sm">{mission.description}</p>
                          </div>
                          <span className="text-accent-primary font-bold">+{mission.reward} PKC</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-text-muted mb-1">
                            <span>Progress</span>
                            <span>{mission.progress}/{mission.maxProgress}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-background-primary overflow-hidden">
                            <div 
                              className="h-full bg-gradient-accent rounded-full transition-all"
                              style={{ width: `${(mission.progress / mission.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Missions */}
                <div className="card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div>
                      <h3 className="font-bold">Weekly Missions</h3>
                      <p className="text-text-muted text-sm">Resets in 5 days</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {missions.filter(m => m.type === 'WEEKLY').map((mission) => (
                      <div key={mission.id} className="p-4 rounded-xl bg-background-tertiary">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{mission.name}</p>
                            <p className="text-text-muted text-sm">{mission.description}</p>
                          </div>
                          <span className="text-accent-gold font-bold">+{mission.reward} PKC</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-text-muted mb-1">
                            <span>Progress</span>
                            <span>{mission.progress}/{mission.maxProgress}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-background-primary overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-accent-gold to-accent-primary rounded-full transition-all"
                              style={{ width: `${(mission.progress / mission.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievements */}
          {activeTab === 'achievements' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={clsx(
                    'card transition-all',
                    achievement.completed 
                      ? 'border-accent-primary/50 bg-accent-primary/5' 
                      : 'hover:border-border-secondary'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={clsx(
                      'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
                      achievement.completed ? 'bg-accent-primary/20' : 'bg-background-tertiary'
                    )}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{achievement.name}</h3>
                        {achievement.completed && (
                          <CheckCircle className="w-4 h-4 text-accent-primary" />
                        )}
                      </div>
                      <p className="text-text-muted text-sm mb-2">{achievement.description}</p>
                      <p className="text-accent-primary font-semibold text-sm">+{achievement.reward} PKC</p>
                    </div>
                  </div>
                  {!achievement.completed && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-text-muted mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-background-tertiary overflow-hidden">
                        <div 
                          className="h-full bg-accent-primary rounded-full transition-all"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* VIP Program */}
          {activeTab === 'vip' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Current Status */}
              <div className="card p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-accent-primary/20 to-accent-gold/20 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <p className="text-text-muted text-sm mb-1">Your VIP Status</p>
                      <h2 className="text-3xl font-bold text-gradient mb-2">{currentLevel.name}</h2>
                      <p className="text-text-secondary">
                        {currentLevel.rakeback}% Rakeback on all games
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted text-sm mb-1">VIP Points</p>
                      <p className="text-3xl font-bold">{currentVipPoints.toLocaleString()}</p>
                      {nextLevel && (
                        <p className="text-text-muted text-sm">
                          {(nextLevel.points - currentVipPoints).toLocaleString()} to {nextLevel.name}
                        </p>
                      )}
                    </div>
                  </div>
                  {nextLevel && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>{currentLevel.name}</span>
                        <span>{nextLevel.name}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-background-primary/50 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-accent rounded-full transition-all"
                          style={{ 
                            width: `${((currentVipPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* VIP Levels */}
              <div className="card">
                <h3 className="text-xl font-bold mb-6">VIP Levels</h3>
                <div className="space-y-4">
                  {vipLevels.map((level, index) => {
                    const isCurrentLevel = level.name === currentLevel.name;
                    const isUnlocked = currentVipPoints >= level.points;
                    
                    return (
                      <div 
                        key={level.level}
                        className={clsx(
                          'flex items-center gap-4 p-4 rounded-xl transition-all',
                          isCurrentLevel 
                            ? 'bg-accent-primary/10 border border-accent-primary/30' 
                            : isUnlocked 
                              ? 'bg-background-tertiary' 
                              : 'bg-background-tertiary/50 opacity-60'
                        )}
                      >
                        <div className={clsx(
                          'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl',
                          isCurrentLevel ? 'bg-accent-primary text-background-primary' : 'bg-background-hover'
                        )}>
                          {level.level}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{level.name}</h4>
                            {isCurrentLevel && (
                              <span className="px-2 py-0.5 rounded text-xs bg-accent-primary text-background-primary font-medium">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className="text-text-muted text-sm">
                            {level.points.toLocaleString()} VIP Points required
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-accent-primary">{level.rakeback}%</p>
                          <p className="text-text-muted text-sm">Rakeback</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
