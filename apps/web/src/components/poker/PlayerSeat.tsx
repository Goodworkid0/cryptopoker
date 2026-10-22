'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, CardData, Chip } from './PlayingCard';
import { User, Timer, Wifi, WifiOff } from 'lucide-react';

export interface Player {
  odiserId: string;
  odiserName: string;
  odiserAvatar?: string;
  seatNumber: number;
  stack: number;
  bet: number;
  cards?: CardData[];
  hasCards: boolean;
  cardCount: number;
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  isSittingOut: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  lastAction?: string;
  isConnected?: boolean;
  isBot?: boolean;
}

interface PlayerSeatProps {
  player?: Player;
  position: { top?: string; bottom?: string; left?: string; right?: string; transform?: string };
  isCurrentPlayer: boolean;
  isMe: boolean;
  seatNumber: number;
  turnTimeLimit?: number;
  onSitDown?: (seatNumber: number) => void;
  onAddBot?: (seatNumber: number) => void;
  onRemoveBot?: (seatNumber: number) => void;
  showBotControls?: boolean;
}

export function PlayerSeat({ 
  player, 
  position, 
  isCurrentPlayer, 
  isMe, 
  seatNumber,
  turnTimeLimit = 30,
  onSitDown,
  onAddBot,
  onRemoveBot,
  showBotControls = false,
}: PlayerSeatProps) {
  const [timeLeft, setTimeLeft] = useState(turnTimeLimit);
  const [showBotMenu, setShowBotMenu] = useState(false);

  useEffect(() => {
    if (isCurrentPlayer && player && !player.isFolded && !player.isAllIn) {
      setTimeLeft(turnTimeLimit);
      const interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCurrentPlayer, player, turnTimeLimit]);

  // Empty seat
  if (!player) {
    return (
      <div className="relative">
        <motion.div
          onClick={() => onSitDown?.(seatNumber)}
          className="w-28 h-24 bg-[#0d1320]/60 backdrop-blur-sm border-2 border-dashed border-gray-600/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#00ff88]/50 hover:bg-[#00ff88]/5 transition-all group"
          style={position}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center mb-1 group-hover:bg-[#00ff88]/20 transition-colors">
            <User className="w-5 h-5 text-gray-500 group-hover:text-[#00ff88]" />
          </div>
          <span className="text-gray-500 text-xs group-hover:text-[#00ff88]">Seat {seatNumber}</span>
        </motion.div>
        
        {/* Bot control button for empty seats */}
        {showBotControls && onAddBot && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBotMenu(!showBotMenu);
              }}
              className="px-2 py-1 bg-purple-600/80 hover:bg-purple-500 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              🤖 Add Bot
            </button>
            
            {/* Bot type menu */}
            <AnimatePresence>
              {showBotMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-[#1a1f2e] border border-[#2a3142] rounded-lg p-1 z-50 min-w-[120px]"
                >
                  {['balanced', 'rocky', 'maniac', 'shark', 'calling-station'].map((type) => (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddBot(seatNumber);
                        setShowBotMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-gray-300 hover:bg-purple-600/30 hover:text-white rounded transition-colors capitalize"
                    >
                      {type === 'calling-station' ? 'Calling Station' : type}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  const timerPercentage = (timeLeft / turnTimeLimit) * 100;
  const timerColor = timerPercentage > 50 ? '#00ff88' : timerPercentage > 25 ? '#ffd700' : '#ff4444';

  return (
    <motion.div
      className={`absolute w-36 rounded-2xl overflow-hidden ${
        isMe ? 'ring-2 ring-[#00ff88]/50' : ''
      } ${
        player.isFolded ? 'opacity-40' : ''
      } ${
        player.isSittingOut ? 'grayscale' : ''
      }`}
      style={position}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Turn timer ring */}
      <AnimatePresence>
        {isCurrentPlayer && !player.isFolded && !player.isAllIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-1 rounded-2xl"
            style={{
              background: `conic-gradient(${timerColor} ${timerPercentage}%, transparent ${timerPercentage}%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main card */}
      <div className={`relative bg-gradient-to-br ${
        isMe ? 'from-[#00ff88]/20 via-[#0d1320] to-[#0d1320]' : 
        isCurrentPlayer ? 'from-[#ffd700]/20 via-[#0d1320] to-[#0d1320]' :
        'from-[#1a1f2e] to-[#0d1320]'
      } border ${
        isCurrentPlayer ? 'border-[#00ff88]' : 'border-gray-700/50'
      } rounded-2xl p-2`}>
        
        {/* Avatar and info */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
              isMe ? 'from-[#00ff88] to-[#00cc6a]' : 'from-gray-600 to-gray-700'
            } flex items-center justify-center text-sm font-bold ${
              isMe ? 'text-[#0a0e17]' : 'text-white'
            } shadow-lg`}>
              {player.odiserAvatar ? (
                <img src={player.odiserAvatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                player.odiserName?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            
            {/* Connection indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${
              player.isConnected !== false ? 'bg-green-500' : 'bg-red-500'
            } border border-[#0d1320]`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {player.odiserName}
              {isMe && <span className="text-[#00ff88] ml-1">(You)</span>}
            </p>
            <p className="text-[#ffd700] text-sm font-bold">
              {player.stack.toLocaleString()} <span className="text-[10px] text-[#ffd700]/70">PKC</span>
            </p>
          </div>
        </div>

        {/* Position badges */}
        <div className="flex gap-1 mb-2 flex-wrap">
          {player.isBot && (
            <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded shadow">
              🤖 BOT
            </span>
          )}
          {player.isDealer && (
            <span className="px-1.5 py-0.5 bg-white text-[#0a0e17] text-[10px] font-bold rounded shadow">
              D
            </span>
          )}
          {player.isSmallBlind && (
            <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded shadow">
              SB
            </span>
          )}
          {player.isBigBlind && (
            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded shadow">
              BB
            </span>
          )}
          {player.isAllIn && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold rounded shadow"
            >
              ALL-IN
            </motion.span>
          )}
          {player.isSittingOut && (
            <span className="px-1.5 py-0.5 bg-gray-600 text-white text-[10px] font-bold rounded shadow">
              AWAY
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="flex gap-1 justify-center min-h-[36px]">
          {player.cards && player.cards.length > 0 ? (
            player.cards.map((card, i) => (
              <PlayingCard key={i} card={card} size="xs" delay={i * 0.1} dealing />
            ))
          ) : player.hasCards ? (
            <>
              <PlayingCard hidden size="xs" delay={0} dealing />
              <PlayingCard hidden size="xs" delay={0.1} dealing />
            </>
          ) : null}
        </div>

        {/* Last action */}
        <AnimatePresence>
          {player.lastAction && !player.isFolded && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-center"
            >
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                player.lastAction.includes('fold') ? 'bg-red-500/20 text-red-400' :
                player.lastAction.includes('check') ? 'bg-blue-500/20 text-blue-400' :
                player.lastAction.includes('call') ? 'bg-blue-500/20 text-blue-400' :
                player.lastAction.includes('all-in') ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 text-orange-400' :
                'bg-[#00ff88]/20 text-[#00ff88]'
              }`}>
                {player.lastAction.toUpperCase()}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bet display */}
      <AnimatePresence>
        {player.bet > 0 && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -10 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1"
          >
            <Chip value={player.bet} size="sm" />
            <span className="text-[#ffd700] text-xs font-bold bg-black/50 px-1.5 py-0.5 rounded">
              {player.bet.toLocaleString()} PKC
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove bot button */}
      {player.isBot && showBotControls && onRemoveBot && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveBot(player.seatNumber);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-400 text-white text-xs rounded-full flex items-center justify-center transition-colors z-10"
          title="Remove bot"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}
