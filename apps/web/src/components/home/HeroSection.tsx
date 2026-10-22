'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Spade, Play, Coins, Shield, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-glow-green opacity-30" />
      </div>

      {/* Floating Cards Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-16 h-24 bg-white rounded-lg shadow-xl"
            initial={{ 
              x: Math.random() * 100 - 50 + '%',
              y: '120%',
              rotate: Math.random() * 30 - 15
            }}
            animate={{
              y: '-20%',
              rotate: Math.random() * 30 - 15,
              transition: {
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                delay: i * 2,
              },
            }}
            style={{
              left: `${15 + i * 18}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            <span className="text-accent-primary font-medium text-sm">Live on Polygon Network</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
            Play Poker.
            <br />
            <span className="text-gradient">Earn Crypto.</span>
          </h1>

          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            The ultimate crypto poker experience. Play Texas Hold'em with PKC tokens, 
            compete in tournaments, and earn rewards on every hand.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/poker" className="btn btn-primary text-lg px-8 py-4 animate-pulse-glow">
              <Play className="w-5 h-5" />
              Play Now
            </Link>
            <Link href="/token" className="btn btn-secondary text-lg px-8 py-4">
              <Coins className="w-5 h-5" />
              Buy PKC Token
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-text-muted">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-primary" />
              <span>Provably Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-gold" />
              <span>Instant Withdrawals</span>
            </div>
            <div className="flex items-center gap-2">
              <Spade className="w-5 h-5 text-accent-purple" />
              <span>24/7 Games</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background-primary to-transparent" />
    </section>
  );
}
