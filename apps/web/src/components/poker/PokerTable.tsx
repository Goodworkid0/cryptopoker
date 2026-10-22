'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PokerTableProps {
  children: ReactNode;
  pot?: number;
  phase?: string;
}

export function PokerTable({ children, pot = 0, phase }: PokerTableProps) {
  return (
    <div className="relative w-full max-w-[1000px] aspect-[2/1]">
      {/* Outer rail */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#5d4037] via-[#4e342e] to-[#3e2723] rounded-[50%] shadow-2xl" />
      
      {/* Inner felt */}
      <div className="absolute inset-[3%] bg-gradient-to-br from-[#1b5e20] via-[#2e7d32] to-[#1b5e20] rounded-[50%] shadow-inner">
        {/* Felt texture overlay */}
        <div 
          className="absolute inset-0 rounded-[50%] opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Table line decoration */}
        <div className="absolute inset-[8%] border-2 border-[#4caf50]/30 rounded-[50%]" />
        
        {/* Center logo area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-20">
          <div className="w-full h-full rounded-full border-4 border-[#ffd700]/50 flex items-center justify-center">
            <span className="text-[#ffd700] font-bold text-2xl">PKC</span>
          </div>
        </div>
        
        {/* Pot display */}
        {pot > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-[35%] left-1/2 -translate-x-1/2 px-6 py-2 bg-black/50 backdrop-blur-sm rounded-full border border-[#ffd700]/30"
          >
            <span className="text-[#ffd700] font-bold text-xl">
              POT: {pot.toLocaleString()} PKC
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Player positions and other elements */}
      {children}
    </div>
  );
}

// Seat position type
export interface SeatPosition {
  x: number; // percentage from left
  y: number; // percentage from top
}

// Seat position helper - returns positions for 2-9 players as x/y percentages
export function getSeatPositions(maxSeats: number): SeatPosition[] {
  const positions: { [key: number]: SeatPosition[] } = {
    2: [
      { x: 50, y: 95 },  // bottom center
      { x: 50, y: 5 },   // top center
    ],
    6: [
      { x: 50, y: 95 },  // bottom center
      { x: 10, y: 70 },  // bottom left
      { x: 10, y: 30 },  // top left
      { x: 50, y: 5 },   // top center
      { x: 90, y: 30 },  // top right
      { x: 90, y: 70 },  // bottom right
    ],
    9: [
      { x: 50, y: 98 },  // bottom center (seat 0)
      { x: 20, y: 85 },  // bottom left 1
      { x: 5, y: 65 },   // left bottom
      { x: 5, y: 35 },   // left top
      { x: 20, y: 15 },  // top left 1
      { x: 50, y: 2 },   // top center
      { x: 80, y: 15 },  // top right 1
      { x: 95, y: 35 },  // right top
      { x: 95, y: 65 },  // right bottom
    ],
  };
  
  return positions[maxSeats] || positions[9];
}
