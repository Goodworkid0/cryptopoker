'use client';

import { motion } from 'framer-motion';

export interface CardData {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

interface PlayingCardProps {
  card?: CardData;
  hidden?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  delay?: number;
  dealing?: boolean;
}

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const sizeClasses = {
  xs: 'w-6 h-9 text-[8px]',
  sm: 'w-10 h-14 text-xs',
  md: 'w-14 h-20 text-sm',
  lg: 'w-20 h-28 text-lg',
};

const symbolSizes = {
  xs: 'text-sm',
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function PlayingCard({ card, hidden = false, size = 'md', delay = 0, dealing = false }: PlayingCardProps) {
  // Card back design
  if (hidden || !card) {
    return (
      <motion.div
        initial={dealing ? { x: -200, y: -100, opacity: 0, rotateZ: -180 } : { scale: 0.8, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotateZ: 0 }}
        transition={{ 
          duration: dealing ? 0.4 : 0.2, 
          delay,
          type: 'spring',
          stiffness: 200,
          damping: 20
        }}
        className={`${sizeClasses[size]} bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#1a237e] rounded-lg border-2 border-[#3949ab] shadow-xl flex items-center justify-center relative overflow-hidden`}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-1 rounded border border-[#5c6bc0]/30">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              rgba(92, 107, 192, 0.3) 4px,
              rgba(92, 107, 192, 0.3) 8px
            )`
          }} />
        </div>
        {/* Center emblem */}
        <div className="relative z-10 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ff8c00] flex items-center justify-center shadow-lg">
          <span className="text-[#1a237e] font-bold" style={{ fontSize: size === 'xs' ? '6px' : size === 'sm' ? '8px' : '12px' }}>PKC</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={dealing ? { x: -200, y: -100, opacity: 0, rotateY: 180 } : { rotateY: 180, scale: 0.8 }}
      animate={{ x: 0, y: 0, opacity: 1, rotateY: 0, scale: 1 }}
      transition={{ 
        duration: dealing ? 0.5 : 0.3, 
        delay,
        type: 'spring',
        stiffness: 150,
        damping: 15
      }}
      className={`${sizeClasses[size]} bg-white rounded-lg shadow-xl flex flex-col relative overflow-hidden cursor-default select-none`}
      style={{ perspective: 1000 }}
    >
      {/* Top left corner */}
      <div className={`absolute top-1 left-1 flex flex-col items-center leading-none ${suitColors[card.suit]}`}>
        <span className="font-bold">{card.rank}</span>
        <span className={symbolSizes[size]}>{suitSymbols[card.suit]}</span>
      </div>
      
      {/* Center suit */}
      <div className={`flex-1 flex items-center justify-center ${suitColors[card.suit]}`}>
        <span className={`${size === 'xs' ? 'text-xl' : size === 'sm' ? 'text-3xl' : size === 'md' ? 'text-4xl' : 'text-6xl'}`}>
          {suitSymbols[card.suit]}
        </span>
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div className={`absolute bottom-1 right-1 flex flex-col items-center leading-none rotate-180 ${suitColors[card.suit]}`}>
        <span className="font-bold">{card.rank}</span>
        <span className={symbolSizes[size]}>{suitSymbols[card.suit]}</span>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
    </motion.div>
  );
}

// Chip component for bets
export function Chip({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const chipColor = value >= 1000 ? 'from-[#ffd700] to-[#ff8c00]' : 
                    value >= 100 ? 'from-[#9c27b0] to-[#7b1fa2]' :
                    value >= 25 ? 'from-[#4caf50] to-[#388e3c]' :
                    value >= 5 ? 'from-[#f44336] to-[#d32f2f]' :
                    'from-gray-400 to-gray-500';

  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[8px]' : 
                    size === 'md' ? 'w-10 h-10 text-xs' : 
                    'w-14 h-14 text-sm';

  return (
    <motion.div
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className={`${sizeClass} rounded-full bg-gradient-to-br ${chipColor} border-2 border-white/30 shadow-lg flex items-center justify-center font-bold text-white`}
    >
      {value >= 1000 ? `${value / 1000}K` : value}
    </motion.div>
  );
}
