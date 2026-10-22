'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/components/auth/AuthProvider';

// Types
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

export interface PlayerState {
  odiserId: string;
  odiserName: string;
  odiserAvatar?: string;
  seatNumber: number;
  stack: number;
  bet: number;
  cards?: Card[];
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
  isBot?: boolean;
}

export interface Pot {
  amount: number;
  eligiblePlayers: string[];
}

export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameState {
  id: string;
  tableId: string;
  phase: GamePhase;
  players: PlayerState[];
  communityCards: Card[];
  pots: Pot[];
  currentBet: number;
  minRaise: number;
  dealerSeat: number;
  currentPlayerSeat: number;
  turnStartTime: number;
  turnTimeLimit: number;
  handNumber: number;
}

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

export interface ValidAction {
  action: ActionType;
  minAmount?: number;
  maxAmount?: number;
}

export interface ChatMessage {
  odiserId?: string;
  username: string;
  message: string;
  timestamp: number;
}

interface GameContextType {
  socket: Socket | null;
  isConnected: boolean;
  gameState: GameState | null;
  validActions: ValidAction[];
  chatMessages: ChatMessage[];
  error: string | null;
  joinTable: (tableId: string, seatNumber?: number, buyIn?: number) => void;
  leaveTable: (tableId: string) => void;
  sendAction: (tableId: string, action: ActionType, amount?: number) => void;
  sendChat: (tableId: string, message: string) => void;
  sitOut: (tableId: string, sitOut: boolean) => void;
  addBot: (tableId: string, seatNumber: number, botType?: string, buyIn?: number) => void;
  removeBot: (tableId: string, seatNumber: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [validActions, setValidActions] = useState<ValidAction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Connect to game socket
  useEffect(() => {
    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/game`, {
      withCredentials: true,
      auth: {
        userId: user?.id,
        username: user?.username,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to game server');
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from game server');
      setIsConnected(false);
    });

    socketInstance.on('connected', (data) => {
      console.log('Game connection confirmed:', data);
    });

    socketInstance.on('error', (data) => {
      console.error('Game error:', data);
      setError(data.message);
      setTimeout(() => setError(null), 5000);
    });

    socketInstance.on('gameState', (state: GameState) => {
      setGameState(state);
    });

    socketInstance.on('spectatorState', (state: GameState) => {
      // Only use spectator state if we're not a player
      if (!user?.id) {
        setGameState(state);
      }
    });

    socketInstance.on('validActions', (actions: ValidAction[]) => {
      setValidActions(actions);
    });

    socketInstance.on('action', (data) => {
      console.log('Player action:', data);
    });

    socketInstance.on('playerJoined', (data) => {
      console.log('Player joined:', data);
    });

    socketInstance.on('playerLeft', (data) => {
      console.log('Player left:', data);
    });

    socketInstance.on('newHand', (data) => {
      console.log('New hand started:', data);
      setChatMessages([]);
    });

    socketInstance.on('chatMessage', (message: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-100), message]);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, user?.username]);

  const joinTable = useCallback((tableId: string, seatNumber?: number, buyIn?: number) => {
    if (socketRef.current) {
      socketRef.current.emit('joinTable', { tableId, seatNumber, buyIn });
      
      // Request valid actions after joining
      if (seatNumber !== undefined) {
        setTimeout(() => {
          socketRef.current?.emit('getValidActions', { tableId });
        }, 500);
      }
    }
  }, []);

  const leaveTable = useCallback((tableId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveTable', { tableId });
      setGameState(null);
      setValidActions([]);
      setChatMessages([]);
    }
  }, []);

  const sendAction = useCallback((tableId: string, action: ActionType, amount?: number) => {
    if (socketRef.current) {
      socketRef.current.emit('playerAction', { tableId, action, amount });
      socketRef.current.emit('getValidActions', { tableId });
    }
  }, []);

  const sendChat = useCallback((tableId: string, message: string) => {
    if (socketRef.current) {
      socketRef.current.emit('chat', { tableId, message });
    }
  }, []);

  const sitOut = useCallback((tableId: string, sitOut: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('sitOut', { tableId, sitOut });
    }
  }, []);

  const addBot = useCallback((tableId: string, seatNumber: number, botType?: string, buyIn?: number) => {
    if (socketRef.current) {
      socketRef.current.emit('addBot', { tableId, seatNumber, botType, buyIn });
    }
  }, []);

  const removeBot = useCallback((tableId: string, seatNumber: number) => {
    if (socketRef.current) {
      socketRef.current.emit('removeBot', { tableId, seatNumber });
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        socket,
        isConnected,
        gameState,
        validActions,
        chatMessages,
        error,
        joinTable,
        leaveTable,
        sendAction,
        sendChat,
        sitOut,
        addBot,
        removeBot,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
