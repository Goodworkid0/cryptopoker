// Card representation
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

// Player state at table
export interface PlayerState {
  odiserId: string;
  odiserName?: string;
  odiserUsername?: string;
  odiserAvatar?: string;
  seatNumber: number;
  stack: number;
  bet: number;
  cards: Card[];
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  isSittingOut: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isBot?: boolean;
  lastAction?: string;
  timeBank?: number;
}

// Game phase
export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

// Player action
export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

export interface PlayerAction {
  odiserId: string;
  action: ActionType;
  amount?: number;
  timestamp: number;
}

// Pot
export interface Pot {
  amount: number;
  eligiblePlayers: string[];
}

// Game state
export interface GameState {
  id: string;
  tableId: string;
  phase: GamePhase;
  players: Map<number, PlayerState>; // seat number -> player
  communityCards: Card[];
  pots: Pot[];
  currentBet: number;
  minRaise: number;
  dealerSeat: number;
  smallBlindSeat: number;
  bigBlindSeat: number;
  currentPlayerSeat: number;
  smallBlind: number;
  bigBlind: number;
  turnStartTime: number;
  turnTimeLimit: number; // seconds
  handNumber: number;
  actions: PlayerAction[];
}

// Hand rankings
export type HandRank = 
  | 'high_card'
  | 'pair'
  | 'two_pair'
  | 'three_of_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_kind'
  | 'straight_flush'
  | 'royal_flush';

export interface HandEvaluation {
  rank: HandRank;
  value: number; // For comparison
  cards: Card[]; // Best 5 cards
  description: string;
}

// Events
export interface GameEvent {
  type: string;
  payload: any;
  timestamp: number;
}

// Table info for client
export interface TableInfo {
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

// Client game state (sanitized - no hidden cards)
export interface ClientGameState {
  id: string;
  tableId: string;
  phase: GamePhase;
  players: ClientPlayerState[];
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

export interface ClientPlayerState {
  odiserId: string;
  odiserName?: string;
  odiserAvatar?: string;
  seatNumber: number;
  stack: number;
  bet: number;
  hasCards: boolean;
  cardCount: number;
  cards?: Card[]; // Only sent to the player themselves
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
