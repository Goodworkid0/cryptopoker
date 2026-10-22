import { Injectable } from '@nestjs/common';
import { GameService } from './game.service';
import { PlayerState, Card, ActionType, HandEvaluation } from './game.types';
import { evaluateHand, getRankValue } from './poker-engine';

/**
 * Bot Strategy Types
 */
export type BotStrategy = 'tight-passive' | 'tight-aggressive' | 'loose-passive' | 'loose-aggressive' | 'random';

/**
 * Bot Personality with adjustable parameters
 */
export interface BotPersonality {
  name: string;
  strategy: BotStrategy;
  vpip: number;        // Voluntarily Put $ In Pot (0-100)
  pfr: number;         // Pre-Flop Raise (0-100)
  aggression: number;  // Post-flop aggression (0-100)
  bluffFrequency: number; // How often to bluff (0-100)
  callStationLevel: number; // How likely to call with weak hands (0-100)
  avatarUrl?: string;
}

/**
 * Pre-defined bot personalities
 */
export const BOT_PERSONALITIES: Record<string, BotPersonality> = {
  'rocky': {
    name: 'Rocky',
    strategy: 'tight-passive',
    vpip: 15,
    pfr: 8,
    aggression: 20,
    bluffFrequency: 5,
    callStationLevel: 30,
  },
  'maniac': {
    name: 'Maniac Mike',
    strategy: 'loose-aggressive',
    vpip: 70,
    pfr: 45,
    aggression: 80,
    bluffFrequency: 40,
    callStationLevel: 60,
  },
  'calling-station': {
    name: 'Calling Carl',
    strategy: 'loose-passive',
    vpip: 65,
    pfr: 10,
    aggression: 15,
    bluffFrequency: 5,
    callStationLevel: 90,
  },
  'shark': {
    name: 'Sharky',
    strategy: 'tight-aggressive',
    vpip: 25,
    pfr: 20,
    aggression: 65,
    bluffFrequency: 25,
    callStationLevel: 30,
  },
  'balanced': {
    name: 'Balance Bot',
    strategy: 'tight-aggressive',
    vpip: 28,
    pfr: 22,
    aggression: 50,
    bluffFrequency: 20,
    callStationLevel: 40,
  },
};

/**
 * Hand strength categories
 */
type HandStrength = 'monster' | 'strong' | 'medium' | 'weak' | 'trash';

@Injectable()
export class BotService {
  private activeBots: Map<string, BotPlayerInfo> = new Map(); // odiserId -> BotPlayerInfo

  constructor(private gameService: GameService) {}

  /**
   * Create a bot player
   */
  createBot(personality: BotPersonality, initialStack: number): BotPlayerInfo {
    const odiserId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const botInfo: BotPlayerInfo = {
      odiserId,
      odiserUsername: personality.name,
      odiserAvatar: personality.avatarUrl || `/avatars/bot-${personality.strategy}.png`,
      personality,
      stack: initialStack,
    };

    this.activeBots.set(odiserId, botInfo);
    return botInfo;
  }

  /**
   * Add bot to a table
   */
  async addBotToTable(tableId: string, seatNumber: number, personality: BotPersonality, buyIn: number): Promise<PlayerState | null> {
    const botInfo = this.createBot(personality, buyIn);

    const player: PlayerState = {
      odiserId: botInfo.odiserId,
      odiserUsername: botInfo.odiserUsername,
      odiserAvatar: botInfo.odiserAvatar,
      seatNumber,
      stack: buyIn,
      bet: 0,
      cards: [],
      isActive: true,
      isFolded: false,
      isAllIn: false,
      isSittingOut: false,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
      isBot: true,
    };

    const success = this.gameService.addPlayer(tableId, player);
    if (success) {
      return player;
    }
    
    this.activeBots.delete(botInfo.odiserId);
    return null;
  }

  /**
   * Remove bot from table
   */
  removeBot(odiserId: string): void {
    this.activeBots.delete(odiserId);
  }

  /**
   * Check if player is a bot
   */
  isBot(odiserId: string): boolean {
    return this.activeBots.has(odiserId);
  }

  /**
   * Get bot's decision
   */
  getBotDecision(
    tableId: string,
    odiserId: string,
  ): { action: ActionType; amount?: number } {
    const botInfo = this.activeBots.get(odiserId);
    if (!botInfo) {
      return { action: 'fold' };
    }

    const game = this.gameService.getGameState(tableId);
    if (!game) {
      return { action: 'fold' };
    }

    const player = Array.from(game.players.values()).find(p => p.odiserId === odiserId);
    if (!player) {
      return { action: 'fold' };
    }

    const { personality } = botInfo;
    const toCall = game.currentBet - player.bet;
    const potSize = game.pots.reduce((sum, pot) => sum + pot.amount, 0);
    
    // Evaluate hand strength
    const handStrength = this.evaluateHandStrength(player.cards, game.communityCards, game.phase);
    
    // Get decision based on personality and situation
    return this.makeDecision(personality, player, game.phase, handStrength, toCall, potSize, game.bigBlind);
  }

  /**
   * Evaluate current hand strength
   */
  private evaluateHandStrength(
    holeCards: Card[],
    communityCards: Card[],
    phase: string,
  ): HandStrength {
    if (phase === 'preflop' || communityCards.length === 0) {
      return this.evaluatePreflopStrength(holeCards);
    }

    // Post-flop: use actual hand evaluation
    const evaluation = evaluateHand(holeCards, communityCards);
    
    // Map hand rank to strength category
    switch (evaluation.rank) {
      case 'royal_flush':
      case 'straight_flush':
      case 'four_of_kind':
        return 'monster';
      case 'full_house':
      case 'flush':
      case 'straight':
        return 'strong';
      case 'three_of_kind':
      case 'two_pair':
        return 'medium';
      case 'pair':
        // Check if it's top pair or better
        const pairValue = this.getPairValue(holeCards, communityCards);
        if (pairValue >= 10) return 'medium';
        return 'weak';
      case 'high_card':
      default:
        return 'trash';
    }
  }

  /**
   * Evaluate preflop hand strength
   */
  private evaluatePreflopStrength(holeCards: Card[]): HandStrength {
    if (holeCards.length !== 2) return 'trash';

    const [card1, card2] = holeCards;
    const rank1 = getRankValue(card1.rank);
    const rank2 = getRankValue(card2.rank);
    const high = Math.max(rank1, rank2);
    const low = Math.min(rank1, rank2);
    const suited = card1.suit === card2.suit;
    const pair = rank1 === rank2;
    const gap = high - low;
    const connected = gap <= 1;

    // Monster hands: AA, KK, QQ, AKs
    if (pair && high >= 12) return 'monster'; // QQ+
    if (high === 14 && low === 13 && suited) return 'monster'; // AKs

    // Strong hands: JJ, TT, AK, AQs, KQs
    if (pair && high >= 10) return 'strong'; // TT, JJ
    if (high === 14 && low === 13) return 'strong'; // AK
    if (high === 14 && low === 12 && suited) return 'strong'; // AQs
    if (high === 13 && low === 12 && suited) return 'strong'; // KQs

    // Medium hands: 99-77, AQ, AJs, KJs, QJs, suited connectors
    if (pair && high >= 7) return 'medium';
    if (high === 14 && low >= 10) return 'medium'; // AT+
    if (suited && high >= 12 && connected) return 'medium'; // Suited connectors with high cards
    if (suited && high >= 10 && gap <= 2) return 'medium'; // Suited one-gappers

    // Weak hands: small pairs, suited aces, broadway cards
    if (pair) return 'weak';
    if (high === 14 && suited) return 'weak'; // Suited aces
    if (high >= 11 && low >= 10) return 'weak'; // Broadway

    return 'trash';
  }

  /**
   * Get the value of paired cards
   */
  private getPairValue(holeCards: Card[], communityCards: Card[]): number {
    const allCards = [...holeCards, ...communityCards];
    const counts = new Map<number, number>();
    
    for (const card of allCards) {
      const value = getRankValue(card.rank);
      counts.set(value, (counts.get(value) || 0) + 1);
    }

    let maxPairValue = 0;
    counts.forEach((count, value) => {
      if (count >= 2 && value > maxPairValue) {
        maxPairValue = value;
      }
    });

    return maxPairValue;
  }

  /**
   * Make decision based on all factors
   */
  private makeDecision(
    personality: BotPersonality,
    player: PlayerState,
    phase: string,
    handStrength: HandStrength,
    toCall: number,
    potSize: number,
    bigBlind: number,
  ): { action: ActionType; amount?: number } {
    const random = Math.random() * 100;
    const potOdds = toCall / (potSize + toCall);
    
    // No cost to continue - always check
    if (toCall === 0) {
      // Decide between check and bet
      const betChance = this.getBetChance(personality, handStrength);
      
      if (random < betChance) {
        const betSize = this.calculateBetSize(personality, handStrength, potSize, bigBlind, player.stack);
        if (betSize >= bigBlind && betSize <= player.stack) {
          return { action: 'bet', amount: betSize };
        }
      }
      return { action: 'check' };
    }

    // Facing a bet
    const callChance = this.getCallChance(personality, handStrength, potOdds, phase);
    const raiseChance = this.getRaiseChance(personality, handStrength, phase);

    // Monster hand - almost always raise
    if (handStrength === 'monster') {
      if (random < 85) {
        const raiseSize = this.calculateRaiseSize(personality, handStrength, toCall, potSize, bigBlind, player.stack);
        if (raiseSize > toCall && raiseSize <= player.stack) {
          return { action: 'raise', amount: player.bet + raiseSize };
        }
      }
      return { action: 'call' };
    }

    // Strong hand
    if (handStrength === 'strong') {
      if (random < raiseChance) {
        const raiseSize = this.calculateRaiseSize(personality, handStrength, toCall, potSize, bigBlind, player.stack);
        if (raiseSize > toCall && raiseSize <= player.stack) {
          return { action: 'raise', amount: player.bet + raiseSize };
        }
      }
      if (random < callChance + raiseChance) {
        if (toCall <= player.stack) {
          return { action: 'call' };
        }
      }
    }

    // Medium hand
    if (handStrength === 'medium') {
      if (random < callChance) {
        if (toCall <= player.stack) {
          return { action: 'call' };
        }
      }
      // Occasional bluff raise
      if (random < personality.bluffFrequency && toCall < potSize * 0.5) {
        const raiseSize = this.calculateRaiseSize(personality, handStrength, toCall, potSize, bigBlind, player.stack);
        if (raiseSize <= player.stack) {
          return { action: 'raise', amount: player.bet + raiseSize };
        }
      }
    }

    // Weak hand
    if (handStrength === 'weak') {
      // Calling station tendency
      if (random < personality.callStationLevel && toCall <= player.stack * 0.1) {
        return { action: 'call' };
      }
      // Bluff
      if (random < personality.bluffFrequency) {
        const raiseSize = this.calculateRaiseSize(personality, 'weak', toCall, potSize, bigBlind, player.stack);
        if (raiseSize <= player.stack) {
          return { action: 'raise', amount: player.bet + raiseSize };
        }
      }
    }

    // Trash - occasionally bluff or call with calling station personality
    if (handStrength === 'trash') {
      if (random < personality.callStationLevel * 0.3 && toCall <= player.stack * 0.05) {
        return { action: 'call' };
      }
      if (random < personality.bluffFrequency * 0.5 && potSize > bigBlind * 3) {
        const raiseSize = potSize * 0.75;
        if (raiseSize <= player.stack) {
          return { action: 'raise', amount: Math.floor(player.bet + raiseSize) };
        }
      }
    }

    return { action: 'fold' };
  }

  /**
   * Calculate chance to bet when checked to
   */
  private getBetChance(personality: BotPersonality, handStrength: HandStrength): number {
    const baseChance = {
      'monster': 90,
      'strong': 70,
      'medium': 40,
      'weak': 15,
      'trash': 5,
    }[handStrength];

    return baseChance * (personality.aggression / 50);
  }

  /**
   * Calculate chance to call
   */
  private getCallChance(
    personality: BotPersonality,
    handStrength: HandStrength,
    potOdds: number,
    phase: string,
  ): number {
    const baseChance = {
      'monster': 99,
      'strong': 85,
      'medium': 55,
      'weak': 25,
      'trash': 5,
    }[handStrength];

    // Adjust for pot odds (simplified)
    const oddsAdjustment = potOdds < 0.25 ? 1.2 : potOdds < 0.5 ? 1.0 : 0.8;
    
    // Calling station adjustment
    const stationAdjustment = 1 + (personality.callStationLevel / 100) * 0.5;

    return Math.min(99, baseChance * oddsAdjustment * stationAdjustment);
  }

  /**
   * Calculate chance to raise
   */
  private getRaiseChance(
    personality: BotPersonality,
    handStrength: HandStrength,
    phase: string,
  ): number {
    const baseChance = {
      'monster': 80,
      'strong': 50,
      'medium': 20,
      'weak': 5,
      'trash': 2,
    }[handStrength];

    return baseChance * (personality.aggression / 50);
  }

  /**
   * Calculate bet size
   */
  private calculateBetSize(
    personality: BotPersonality,
    handStrength: HandStrength,
    potSize: number,
    bigBlind: number,
    stack: number,
  ): number {
    // Base bet sizing as percentage of pot
    const basePct = {
      'monster': 0.75,
      'strong': 0.65,
      'medium': 0.5,
      'weak': 0.4,
      'trash': 0.33,
    }[handStrength];

    // Aggression adjustment
    const aggMultiplier = 0.7 + (personality.aggression / 100) * 0.6;
    
    let betSize = Math.max(potSize * basePct * aggMultiplier, bigBlind);
    
    // Add some randomness (±20%)
    betSize *= 0.8 + Math.random() * 0.4;
    
    return Math.min(Math.floor(betSize), stack);
  }

  /**
   * Calculate raise size
   */
  private calculateRaiseSize(
    personality: BotPersonality,
    handStrength: HandStrength,
    toCall: number,
    potSize: number,
    bigBlind: number,
    stack: number,
  ): number {
    // Raise sizing (times the call amount or pot percentage)
    const baseMultiplier = {
      'monster': 3.5,
      'strong': 3,
      'medium': 2.5,
      'weak': 2.2,
      'trash': 2,
    }[handStrength];

    let raiseSize = Math.max(toCall * baseMultiplier, potSize * 0.5);
    
    // Aggression adjustment
    raiseSize *= 0.8 + (personality.aggression / 100) * 0.4;
    
    // Add randomness
    raiseSize *= 0.85 + Math.random() * 0.3;
    
    return Math.min(Math.floor(raiseSize), stack);
  }
}

/**
 * Bot player info
 */
export interface BotPlayerInfo {
  odiserId: string;
  odiserUsername: string;
  odiserAvatar: string;
  personality: BotPersonality;
  stack: number;
}
