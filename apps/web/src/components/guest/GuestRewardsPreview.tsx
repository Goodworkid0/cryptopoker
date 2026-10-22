'use client';

import { motion } from 'framer-motion';
import { 
  Gift, 
  Trophy, 
  Star, 
  Crown,
  Zap,
  Target,
  Lock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export function GuestRewardsPreview() {
  const previewRewards = [
    { day: 1, amount: 100, icon: Gift },
    { day: 2, amount: 150, icon: Gift },
    { day: 3, amount: 250, icon: Gift },
    { day: 4, amount: 400, icon: Star },
    { day: 5, amount: 600, icon: Star },
    { day: 6, amount: 1000, icon: Trophy },
    { day: 7, amount: 1500, icon: Crown },
  ];

  const vipLevels = [
    { name: 'Bronze', rakeback: '5%', color: 'text-amber-600' },
    { name: 'Silver', rakeback: '10%', color: 'text-gray-400' },
    { name: 'Gold', rakeback: '15%', color: 'text-accent-gold' },
    { name: 'Platinum', rakeback: '20%', color: 'text-purple-400' },
    { name: 'Diamond', rakeback: '30%', color: 'text-accent-blue' },
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
          <span className="text-gradient">Earn Rewards</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Join CryptoPoker and unlock daily bonuses, complete missions, earn achievements, 
          and climb our VIP program for exclusive perks.
        </p>
      </motion.div>

      {/* Daily Bonus Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-accent-gold/5" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Daily Login Bonus</h2>
              <p className="text-text-muted">Claim free PKC tokens every day</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {previewRewards.map((reward, index) => (
              <div
                key={reward.day}
                className="relative group"
              >
                <div className="aspect-square rounded-xl bg-background-tertiary border border-border-primary flex flex-col items-center justify-center p-2 transition-all group-hover:border-accent-primary/50">
                  <reward.icon className="w-5 h-5 text-accent-primary mb-1" />
                  <span className="text-xs text-text-muted">Day {reward.day}</span>
                  <span className="text-sm font-bold text-accent-gold">{reward.amount}</span>
                </div>
                {index < 6 && (
                  <div className="absolute top-1/2 -right-1 w-2 h-0.5 bg-border-primary" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-background-tertiary/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-text-muted" />
              <span className="text-text-secondary">Sign in to start claiming daily rewards</span>
            </div>
            <Link href="/register" className="btn-primary btn-sm flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Missions Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-secondary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-accent-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Daily Missions</h2>
              <p className="text-text-muted">Complete tasks for bonus PKC</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Win 3 Hands', reward: 50 },
              { title: 'Play 10 Hands', reward: 30 },
              { title: 'Join a Tournament', reward: 100 },
            ].map((mission, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background-hover flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent-gold" />
                  </div>
                  <span className="text-text-primary">{mission.title}</span>
                </div>
                <span className="text-accent-gold font-bold">+{mission.reward} PKC</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-gold/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Achievements</h2>
              <p className="text-text-muted">Unlock badges and earn rewards</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'First Blood', icon: '🏆' },
              { name: 'Shark', icon: '🦈' },
              { name: 'High Roller', icon: '💎' },
              { name: 'Champion', icon: '👑' },
              { name: 'Royal Flush', icon: '🃏' },
              { name: 'Grinder', icon: '⚡' },
            ].map((achievement, index) => (
              <div key={index} className="aspect-square rounded-xl bg-background-tertiary border border-border-primary flex flex-col items-center justify-center p-2 opacity-50">
                <span className="text-2xl mb-1">{achievement.icon}</span>
                <span className="text-xs text-text-muted text-center">{achievement.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* VIP Program Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">VIP Program</h2>
            <p className="text-text-muted">Climb the ranks for exclusive benefits</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          {vipLevels.map((level, index) => (
            <div key={level.name} className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-background-tertiary border-2 border-border-primary flex items-center justify-center mb-2">
                <Crown className={`w-8 h-8 ${level.color}`} />
              </div>
              <p className={`font-bold ${level.color}`}>{level.name}</p>
              <p className="text-sm text-accent-primary">{level.rakeback} Rakeback</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500/10 to-accent-gold/10 rounded-xl">
          <Link href="/register" className="btn-primary flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Join Now & Start Earning
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
