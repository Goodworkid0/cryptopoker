'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  PlayingCard,
  PokerTable,
  PlayerSeat,
  ActionPanel,
  TableChat,
  HandHistory,
  SessionStats,
  getSeatPositions,
  type SeatPosition,
  type CardData,
  type Player,
  type ValidAction,
  type ActionType,
} from '@/components/poker';
import { useGame, type PlayerState } from '@/context/GameContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { tablesApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

// Types
interface TableInfo {
  id: string;
  name: string;
  type: string;
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn: number;
  maxPlayers: number;
  currentPlayers: number;
}

interface ChatMessage {
  id?: string;
  username: string;
  message: string;
  timestamp: number;
  type?: 'chat' | 'system' | 'action';
}

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

// Format PKC amount
function formatPKC(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toLocaleString();
}

// Seat Modal Component
function SeatModal({ 
  isOpen, 
  onClose, 
  seatIndex, 
  minBuyIn, 
  maxBuyIn,
  userBalance,
  onSit,
  onFaucetClaim,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  seatIndex: number;
  minBuyIn: number;
  maxBuyIn: number;
  userBalance: number;
  onSit: (amount: number) => void;
  onFaucetClaim: () => Promise<void>;
}) {
  // Effective max is the lesser of table max and user balance
  const effectiveMax = Math.min(maxBuyIn, userBalance);
  const canAfford = userBalance >= minBuyIn;
  const [buyIn, setBuyIn] = useState(Math.min(minBuyIn, effectiveMax));
  const [claiming, setClaiming] = useState(false);

  // Update buyIn when modal opens with new values
  useEffect(() => {
    if (isOpen) {
      setBuyIn(Math.min(minBuyIn, effectiveMax));
    }
  }, [isOpen, minBuyIn, effectiveMax]);

  const handleFaucetClaim = async () => {
    setClaiming(true);
    try {
      await onFaucetClaim();
    } finally {
      setClaiming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1a1f2e] border border-[#2a3142] rounded-xl p-6 w-[400px]"
      >
        <h3 className="text-xl font-bold text-white mb-4">Take Seat #{seatIndex + 1}</h3>
        
        {/* User Balance Display */}
        <div className="mb-4 p-3 bg-[#0a0e17] rounded-lg border border-[#2a3142]">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Your Balance</span>
            <span className="text-[#ffd700] font-bold">{formatPKC(userBalance)} PKC</span>
          </div>
        </div>

        {!canAfford ? (
          <div className="text-center py-4">
            <div className="text-red-400 mb-2">Insufficient Balance</div>
            <p className="text-gray-500 text-sm mb-4">
              You need at least {formatPKC(minBuyIn)} PKC to sit at this table.
            </p>
            
            {/* Faucet button */}
            <div className="mb-4 p-4 bg-gradient-to-br from-[#00ff88]/10 to-[#ffd700]/10 rounded-lg border border-[#00ff88]/30">
              <p className="text-[#00ff88] text-sm mb-3">🎁 Get free test PKC!</p>
              <button
                onClick={handleFaucetClaim}
                disabled={claiming}
                className="w-full py-3 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {claiming ? 'Claiming...' : 'Claim 10,000 PKC'}
              </button>
              <p className="text-gray-500 text-xs mt-2">Available once every 24 hours</p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#2a3142] text-gray-300 rounded-lg hover:bg-[#3a4152] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Buy-in Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={buyIn}
                  onChange={(e) => setBuyIn(Math.max(minBuyIn, Math.min(effectiveMax, Number(e.target.value))))}
                  className="w-full bg-[#0a0e17] border border-[#2a3142] rounded-lg px-4 py-3 text-white text-lg pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ffd700] font-medium">PKC</span>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Min: {formatPKC(minBuyIn)} PKC</span>
                <span>Max: {formatPKC(effectiveMax)} PKC</span>
              </div>
            </div>

            <input
              type="range"
              min={minBuyIn}
              max={effectiveMax}
              value={buyIn}
              onChange={(e) => setBuyIn(Number(e.target.value))}
              className="w-full mb-6 accent-[#00ff88]"
            />

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                minBuyIn, 
                Math.round((effectiveMax - minBuyIn) * 0.33 + minBuyIn), 
                Math.round((effectiveMax - minBuyIn) * 0.66 + minBuyIn), 
                effectiveMax
              ].filter((v, i, a) => a.indexOf(v) === i).map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBuyIn(amount)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    buyIn === amount 
                      ? 'bg-[#00ff88] text-black' 
                      : 'bg-[#2a3142] text-gray-300 hover:bg-[#3a4152]'
                  }`}
                >
                  {formatPKC(amount)}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#2a3142] text-gray-300 rounded-lg font-medium hover:bg-[#3a4152] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSit(buyIn);
                  onClose();
                }}
                className="flex-1 py-3 bg-[#00ff88] text-black rounded-lg font-bold hover:bg-[#00cc6a] transition-colors"
              >
                Sit Down
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// Table Header Component
function TableHeader({ 
  tableName, 
  gameType, 
  stakes, 
  playerCount, 
  maxSeats,
  handNumber,
  phase,
}: { 
  tableName: string;
  gameType: string;
  stakes: string;
  playerCount: number;
  maxSeats: number;
  handNumber?: number;
  phase?: string;
}) {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
      <div>
        <Link href="/lobbies" className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Lobby</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">{tableName}</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="px-2 py-0.5 bg-[#00ff88]/20 text-[#00ff88] rounded text-sm font-medium">
            {gameType.replace('_', ' ')}
          </span>
          <span className="text-[#ffd700] font-semibold">{stakes}</span>
          <span className="text-gray-400 text-sm">{playerCount}/{maxSeats} Players</span>
          {handNumber && handNumber > 0 && (
            <span className="text-gray-500 text-sm">Hand #{handNumber}</span>
          )}
          {phase && phase !== 'waiting' && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs uppercase">
              {phase}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 bg-[#1a1f2e] border border-[#2a3142] rounded-lg hover:bg-[#2a3142] transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Convert context player to component player
function convertPlayer(player: PlayerState, currentSeat?: number): Player {
  return {
    odiserId: player.odiserId,
    odiserName: player.odiserName || 'Unknown',
    odiserAvatar: player.odiserAvatar,
    seatNumber: player.seatNumber,
    stack: player.stack,
    bet: player.bet,
    cards: player.cards as CardData[] | undefined,
    hasCards: player.hasCards,
    cardCount: player.cardCount,
    isActive: player.seatNumber === currentSeat,
    isFolded: player.isFolded,
    isAllIn: player.isAllIn,
    isSittingOut: player.isSittingOut,
    isDealer: player.isDealer,
    isSmallBlind: player.isSmallBlind,
    isBigBlind: player.isBigBlind,
    lastAction: player.lastAction,
    isConnected: true,
    isBot: player.isBot,
  };
}

export default function TablePage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;
  const { user } = useAuth();

  // Game context - real WebSocket connection
  const {
    isConnected,
    gameState,
    validActions,
    chatMessages: contextChatMessages,
    error,
    joinTable,
    leaveTable,
    sendAction,
    sendChat,
    addBot,
    removeBot,
  } = useGame();

  // Local state
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [handHistory, setHandHistory] = useState<HandHistoryEntry[]>([]);
  const [sessionStats, setSessionStats] = useState({
    handsPlayed: 0,
    handsWon: 0,
    biggestPot: 0,
    netProfit: 0,
  });
  const [showBotMenu, setShowBotMenu] = useState<number | null>(null);

  // Fetch table info from API
  useEffect(() => {
    const fetchTable = async () => {
      try {
        const { data } = await tablesApi.getById(tableId);
        setTableInfo(data);
      } catch (err) {
        console.error('Failed to fetch table:', err);
        router.push('/lobbies');
      } finally {
        setLoading(false);
      }
    };
    fetchTable();
  }, [tableId, router]);

  // Join table room when WebSocket is connected
  useEffect(() => {
    if (isConnected && tableId) {
      console.log('Joining table:', tableId);
      joinTable(tableId);
    }

    return () => {
      if (tableId) {
        console.log('Leaving table:', tableId);
        leaveTable(tableId);
      }
    };
  }, [isConnected, tableId, joinTable, leaveTable]);

  // Calculate positions for players
  const maxSeats = tableInfo?.maxPlayers || 9;
  const seatPositions = useMemo(() => getSeatPositions(maxSeats), [maxSeats]);

  // Find my player in the game
  const myPlayer = gameState?.players.find(p => p.odiserId === user?.id);
  const isMyTurn = gameState?.currentPlayerSeat !== undefined && 
    myPlayer?.seatNumber === gameState.currentPlayerSeat &&
    gameState.phase !== 'waiting' && 
    gameState.phase !== 'showdown';

  // Convert valid actions to component format
  const componentValidActions: ValidAction[] = validActions.map(a => ({
    action: a.action,
    minAmount: a.minAmount,
    maxAmount: a.maxAmount,
  }));

  // Convert chat messages
  const chatMessages: ChatMessage[] = contextChatMessages.map((msg, i) => ({
    id: i.toString(),
    username: msg.username,
    message: msg.message,
    timestamp: msg.timestamp,
    type: 'chat' as const,
  }));

  // Handle player actions (fold, check, call, raise, all-in)
  const handleAction = useCallback((action: ActionType, amount?: number) => {
    if (tableId) {
      console.log('Sending action:', action, amount);
      sendAction(tableId, action, amount);
    }
  }, [tableId, sendAction]);

  // Handle chat messages
  const handleSendChat = useCallback((message: string) => {
    if (tableId) {
      sendChat(tableId, message);
    }
  }, [tableId, sendChat]);

  // Handle sitting down at an empty seat
  const handleSitDown = useCallback((seatNumber: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedSeat(seatNumber);
    setShowSeatModal(true);
  }, [user, router]);

  // Confirm sit down with buy-in amount
  const handleConfirmSit = useCallback((amount: number) => {
    if (selectedSeat !== null && tableId) {
      console.log('Sitting down at seat', selectedSeat, 'with', amount);
      joinTable(tableId, selectedSeat, amount);
    }
  }, [selectedSeat, tableId, joinTable]);

  // Handle faucet claim
  const { checkAuth } = useAuthStore();
  const handleFaucetClaim = useCallback(async () => {
    try {
      await walletApi.claimFaucet();
      // Refresh user data to get updated balance
      await checkAuth();
    } catch (error: any) {
      console.error('Faucet claim failed:', error);
      alert(error.response?.data?.message || 'Failed to claim faucet');
    }
  }, [checkAuth]);

  // Handle adding a bot to a seat
  const handleAddBot = useCallback((seatNumber: number, botType: string = 'balanced') => {
    if (tableId && tableInfo) {
      addBot(tableId, seatNumber, botType, tableInfo.minBuyIn);
      setShowBotMenu(null);
    }
  }, [tableId, tableInfo, addBot]);

  // Handle removing a bot from a seat
  const handleRemoveBot = useCallback((seatNumber: number) => {
    if (tableId) {
      removeBot(tableId, seatNumber);
    }
  }, [tableId, removeBot]);

  // Leave the table
  const handleLeaveTable = useCallback(() => {
    if (tableId) {
      leaveTable(tableId);
      router.push('/lobbies');
    }
  }, [tableId, leaveTable, router]);

  // Get position style for seat
  const getPositionStyle = (pos: SeatPosition) => ({
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: 'translate(-50%, -50%)',
  });

  // Calculate total pot
  const totalPot = gameState?.pots.reduce((sum, pot) => sum + pot.amount, 0) || 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading table...</p>
        </div>
      </div>
    );
  }

  // Table not found
  if (!tableInfo) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Table not found</p>
          <Link href="/lobbies" className="text-[#00ff88] hover:underline">
            Back to Lobby
          </Link>
        </div>
      </div>
    );
  }

  // Convert players from game state
  const players: Player[] = (gameState?.players || []).map(p => ({
    ...convertPlayer(p, gameState?.currentPlayerSeat),
  }));

  return (
    <div className="min-h-screen bg-[#0a0e17] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17] via-[#0f1520] to-[#0a0e17]" />
      
      {/* Header */}
      <TableHeader
        tableName={tableInfo.name}
        gameType={tableInfo.type}
        stakes={`${tableInfo.smallBlind}/${tableInfo.bigBlind} PKC`}
        playerCount={players.length}
        maxSeats={maxSeats}
        handNumber={gameState?.handNumber}
        phase={gameState?.phase}
      />

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main table area */}
      <div className="relative flex items-center justify-center min-h-screen pt-20 pb-48">
        <PokerTable pot={totalPot}>
          {/* Community Cards */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] flex gap-2">
            <AnimatePresence>
              {(gameState?.communityCards || []).map((card, index) => (
                <motion.div
                  key={`${card.suit}-${card.rank}-${index}`}
                  initial={{ opacity: 0, y: -50, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  <PlayingCard card={card as CardData} size="md" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Phase indicator when waiting */}
          {(!gameState || gameState.phase === 'waiting') && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-gray-400 text-lg">
                {players.length < 2 
                  ? 'Waiting for players...' 
                  : 'Starting soon...'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {players.length}/2 players needed
              </p>
            </div>
          )}

          {/* Player seats */}
          {seatPositions.map((pos, index) => {
            const player = players.find(p => p.seatNumber === index);
            
            return (
              <div
                key={`seat-${index}`}
                className="absolute"
                style={getPositionStyle(pos)}
              >
                <PlayerSeat
                  player={player}
                  position={{}}
                  isCurrentPlayer={player?.seatNumber === gameState?.currentPlayerSeat && gameState?.phase !== 'waiting'}
                  isMe={player?.odiserId === user?.id}
                  seatNumber={index}
                  turnTimeLimit={gameState?.turnTimeLimit || 30}
                  onSitDown={handleSitDown}
                  onAddBot={handleAddBot}
                  onRemoveBot={handleRemoveBot}
                  showBotControls={!!myPlayer}
                />
              </div>
            );
          })}
        </PokerTable>
      </div>

      {/* Action Panel - Fixed at bottom when it's my turn */}
      {isMyTurn && myPlayer && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <ActionPanel
            validActions={componentValidActions}
            currentBet={gameState?.currentBet || 0}
            myBet={myPlayer.bet}
            myStack={myPlayer.stack}
            bigBlind={tableInfo.bigBlind}
            pot={totalPot}
            onAction={handleAction}
          />
        </div>
      )}

      {/* Leave table button when sitting */}
      {myPlayer && !isMyTurn && (
        <button
          onClick={handleLeaveTable}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
        >
          Leave Table
        </button>
      )}

      {/* Side panels */}
      <div className="fixed right-4 top-32 z-10">
        <TableChat
          messages={chatMessages}
          onSend={handleSendChat}
          isOpen={showChat}
          onToggle={() => setShowChat(!showChat)}
        />
      </div>

      {/* Hand History */}
      <HandHistory
        history={handHistory}
        isOpen={showHistory}
        onToggle={() => setShowHistory(!showHistory)}
      />

      {/* Session Stats - Left side */}
      {myPlayer && (
        <div className="fixed left-4 bottom-4 z-10">
          <SessionStats
            handsPlayed={sessionStats.handsPlayed}
            handsWon={sessionStats.handsWon}
            biggestPot={sessionStats.biggestPot}
            netProfit={sessionStats.netProfit}
          />
        </div>
      )}

      {/* Connection indicator */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
          isConnected ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00ff88]' : 'bg-red-400'} animate-pulse`} />
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Seat selection modal */}
      <AnimatePresence>
        {showSeatModal && selectedSeat !== null && tableInfo && (
          <SeatModal
            isOpen={showSeatModal}
            onClose={() => setShowSeatModal(false)}
            seatIndex={selectedSeat}
            minBuyIn={tableInfo.minBuyIn}
            maxBuyIn={tableInfo.maxBuyIn}
            userBalance={parseFloat(user?.wallet?.balance || '0') - parseFloat(user?.wallet?.lockedBalance || '0')}
            onSit={handleConfirmSit}
            onFaucetClaim={handleFaucetClaim}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
