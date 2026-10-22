'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

export interface ValidAction {
  action: ActionType;
  minAmount?: number;
  maxAmount?: number;
}

interface ActionPanelProps {
  validActions: ValidAction[];
  currentBet: number;
  myBet: number;
  myStack: number;
  bigBlind: number;
  pot: number;
  onAction: (action: ActionType, amount?: number) => void;
  disabled?: boolean;
}

export function ActionPanel({
  validActions,
  currentBet,
  myBet,
  myStack,
  bigBlind,
  pot,
  onAction,
  disabled = false,
}: ActionPanelProps) {
  const raiseAction = validActions.find(a => a.action === 'raise' || a.action === 'bet');
  const [raiseAmount, setRaiseAmount] = useState(raiseAction?.minAmount || bigBlind);
  const toCall = currentBet - myBet;

  // Preset bet sizes
  const presetSizes = [
    { label: 'Min', value: raiseAction?.minAmount || bigBlind },
    { label: '½ Pot', value: Math.max(raiseAction?.minAmount || bigBlind, Math.floor(pot / 2)) },
    { label: 'Pot', value: Math.max(raiseAction?.minAmount || bigBlind, pot) },
    { label: 'All-in', value: myStack + myBet },
  ];

  const adjustRaise = useCallback((delta: number) => {
    setRaiseAmount(prev => {
      const newVal = prev + delta;
      const min = raiseAction?.minAmount || bigBlind;
      const max = raiseAction?.maxAmount || myStack + myBet;
      return Math.max(min, Math.min(max, newVal));
    });
  }, [raiseAction, bigBlind, myStack, myBet]);

  if (validActions.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="bg-[#0d1320]/95 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 shadow-2xl w-full max-w-lg"
    >
      {/* Main action buttons */}
      <div className="flex gap-2 mb-4">
        {/* Fold */}
        {validActions.some(a => a.action === 'fold') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction('fold')}
            disabled={disabled}
            className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            FOLD
          </motion.button>
        )}

        {/* Check */}
        {validActions.some(a => a.action === 'check') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction('check')}
            disabled={disabled}
            className="flex-1 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CHECK
          </motion.button>
        )}

        {/* Call */}
        {validActions.some(a => a.action === 'call') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction('call')}
            disabled={disabled}
            className="flex-1 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col">
              <span>CALL</span>
              <span className="text-sm opacity-75">{toCall.toLocaleString()} PKC</span>
            </div>
          </motion.button>
        )}

        {/* Bet/Raise button */}
        {raiseAction && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction(raiseAction.action, raiseAmount)}
            disabled={disabled}
            className="flex-1 py-3 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col">
              <span>{raiseAction.action === 'bet' ? 'BET' : 'RAISE'}</span>
              <span className="text-sm opacity-75">{raiseAmount.toLocaleString()} PKC</span>
            </div>
          </motion.button>
        )}

        {/* All-in */}
        {validActions.some(a => a.action === 'allin') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction('allin')}
            disabled={disabled}
            className="py-3 px-4 bg-gradient-to-r from-[#ffd700]/20 to-[#ff8c00]/20 hover:from-[#ffd700]/30 hover:to-[#ff8c00]/30 border border-[#ffd700]/30 text-[#ffd700] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col">
              <span>ALL-IN</span>
              <span className="text-sm opacity-75">{myStack.toLocaleString()} PKC</span>
            </div>
          </motion.button>
        )}
      </div>

      {/* Raise slider - only show if raise/bet is available */}
      {raiseAction && (
        <div className="space-y-3">
          {/* Preset buttons */}
          <div className="flex gap-2">
            {presetSizes.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setRaiseAmount(Math.min(preset.value, raiseAction.maxAmount || preset.value))}
                className="flex-1 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustRaise(-bigBlind)}
              className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="range"
                min={raiseAction.minAmount || bigBlind}
                max={raiseAction.maxAmount || myStack + myBet}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #00ff88 ${((raiseAmount - (raiseAction.minAmount || bigBlind)) / ((raiseAction.maxAmount || myStack + myBet) - (raiseAction.minAmount || bigBlind))) * 100}%, #374151 0%)`
                }}
              />
            </div>
            
            <button
              onClick={() => adjustRaise(bigBlind)}
              className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Amount input */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Amount:</span>
            <input
              type="number"
              value={raiseAmount}
              onChange={(e) => {
                const val = Number(e.target.value);
                const min = raiseAction.minAmount || bigBlind;
                const max = raiseAction.maxAmount || myStack + myBet;
                setRaiseAmount(Math.max(min, Math.min(max, val)));
              }}
              className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-center font-mono"
            />
            <span className="text-[#ffd700] font-bold">PKC</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
