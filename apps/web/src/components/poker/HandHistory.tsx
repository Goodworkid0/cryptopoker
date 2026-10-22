'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Clock, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { PlayingCard, CardData } from './PlayingCard';

interface HandHistoryEntry {
  id: string;
  handNumber: number;
  winners: string[];
  pot: number;
  communityCards: CardData[];
  myCards?: CardData[];
  result?: 'won' | 'lost' | 'folded';
  winAmount?: number;
  timestamp: number;
}

interface HandHistoryProps {
  history: HandHistoryEntry[];
  isOpen: boolean;
  onToggle: () => void;
}

export function HandHistory({ history, isOpen, onToggle }: HandHistoryProps) {
  const [selectedHand, setSelectedHand] = useState<HandHistoryEntry | null>(null);

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={onToggle}
        className="fixed top-24 right-4 px-4 py-2 bg-[#0d1320] border border-gray-700/50 rounded-xl flex items-center gap-2 hover:border-[#00ff88]/50 transition-all shadow-lg"
      >
        <History className="w-4 h-4 text-[#00ff88]" />
        <span className="text-white text-sm font-medium">History</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-24 right-4 w-80 max-h-[70vh] bg-[#0d1320]/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1f2e] border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#00ff88]" />
          <span className="text-white font-medium">Hand History</span>
        </div>
        <button onClick={onToggle} className="text-gray-400 hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* History list */}
      <div className="overflow-y-auto max-h-[calc(70vh-52px)] divide-y divide-gray-700/30">
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No hands played yet
          </div>
        ) : (
          history.map((hand) => (
            <motion.div
              key={hand.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedHand(selectedHand?.id === hand.id ? null : hand)}
              className="p-3 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Hand #{hand.handNumber}</span>
                <span className="text-gray-500 text-xs">
                  {new Date(hand.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {hand.communityCards.slice(0, 5).map((card, i) => (
                    <PlayingCard key={i} card={card} size="xs" />
                  ))}
                </div>
                <div className={`text-sm font-bold ${
                  hand.result === 'won' ? 'text-[#00ff88]' : 
                  hand.result === 'lost' ? 'text-red-400' : 
                  'text-gray-400'
                }`}>
                  {hand.result === 'won' && hand.winAmount ? `+${hand.winAmount}` : 
                   hand.result === 'folded' ? 'Folded' : 
                   hand.result === 'lost' ? 'Lost' : '-'}
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {selectedHand?.id === hand.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-gray-700/30"
                  >
                    {hand.myCards && (
                      <div className="mb-2">
                        <span className="text-gray-400 text-xs block mb-1">Your cards:</span>
                        <div className="flex gap-1">
                          {hand.myCards.map((card, i) => (
                            <PlayingCard key={i} card={card} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Total Pot:</span>
                      <span className="text-[#ffd700] font-bold">{hand.pot.toLocaleString()} PKC</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-400">Winner(s):</span>
                      <span className="text-[#00ff88]">{hand.winners.join(', ')}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// Stats overlay for the session
interface SessionStatsProps {
  handsPlayed: number;
  handsWon: number;
  biggestPot: number;
  netProfit: number;
}

export function SessionStats({ handsPlayed, handsWon, biggestPot, netProfit }: SessionStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-4 py-2 bg-[#0d1320]/80 backdrop-blur-sm rounded-xl border border-gray-700/30"
    >
      <div className="flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-white text-sm font-medium">{handsPlayed}</span>
        <span className="text-gray-500 text-xs">hands</span>
      </div>
      
      <div className="w-px h-4 bg-gray-700" />
      
      <div className="flex items-center gap-1.5">
        <Award className="w-4 h-4 text-[#00ff88]" />
        <span className="text-white text-sm font-medium">{handsWon}</span>
        <span className="text-gray-500 text-xs">won</span>
      </div>
      
      <div className="w-px h-4 bg-gray-700" />
      
      <div className="flex items-center gap-1.5">
        <TrendingUp className={`w-4 h-4 ${netProfit >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`} />
        <span className={`text-sm font-bold ${netProfit >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
          {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}
        </span>
        <span className="text-gray-500 text-xs">PKC</span>
      </div>
    </motion.div>
  );
}
