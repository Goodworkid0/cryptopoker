import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GameState,
  PlayerState,
  Card,
  GamePhase,
  ActionType,
  Pot,
  ClientGameState,
  ClientPlayerState,
  HandEvaluation,
} from './game.types';
import {
  createDeck,
  shuffleDeck,
  evaluateHand,
  compareHands,
} from './poker-engine';

@Injectable()
export class GameService {
  private activeGames: Map<string, GameState> = new Map();
  private decks: Map<string, Card[]> = new Map();

  constructor(private prisma: PrismaService) {}

  // Create a new game at a table
  async createGame(tableId: string, smallBlind: number, bigBlind: number): Promise<GameState> {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const gameState: GameState = {
      id: gameId,
      tableId,
      phase: 'waiting',
      players: new Map(),
      communityCards: [],
      pots: [{ amount: 0, eligiblePlayers: [] }],
      currentBet: 0,
      minRaise: bigBlind,
      dealerSeat: -1,
      smallBlindSeat: -1,
      bigBlindSeat: -1,
      currentPlayerSeat: -1,
      smallBlind,
      bigBlind,
      turnStartTime: 0,
      turnTimeLimit: 30,
      handNumber: 0,
      actions: [],
    };

    this.activeGames.set(tableId, gameState);
    return gameState;
  }

  // Get game state for a table
  getGameState(tableId: string): GameState | undefined {
    return this.activeGames.get(tableId);
  }

  // Add player to game
  addPlayer(tableId: string, player: PlayerState): boolean {
    const game = this.activeGames.get(tableId);
    if (!game) return false;

    if (game.players.has(player.seatNumber)) return false;

    game.players.set(player.seatNumber, player);
    return true;
  }

  // Remove player from game
  removePlayer(tableId: string, seatNumber: number): PlayerState | undefined {
    const game = this.activeGames.get(tableId);
    if (!game) return undefined;

    const player = game.players.get(seatNumber);
    game.players.delete(seatNumber);
    return player;
  }

  // Get active players (not folded, not sitting out)
  private getActivePlayers(game: GameState): PlayerState[] {
    return Array.from(game.players.values())
      .filter(p => p.isActive && !p.isFolded && !p.isSittingOut);
  }

  // Get next active seat
  private getNextActiveSeat(game: GameState, currentSeat: number): number {
    const seats = Array.from(game.players.keys()).sort((a, b) => a - b);
    const currentIndex = seats.indexOf(currentSeat);
    
    for (let i = 1; i <= seats.length; i++) {
      const nextIndex = (currentIndex + i) % seats.length;
      const nextSeat = seats[nextIndex];
      const player = game.players.get(nextSeat);
      
      if (player && player.isActive && !player.isFolded && !player.isSittingOut && !player.isAllIn) {
        return nextSeat;
      }
    }
    
    return -1;
  }

  // Start a new hand
  startHand(tableId: string): GameState | null {
    const game = this.activeGames.get(tableId);
    if (!game) return null;

    const activePlayers = this.getActivePlayers(game);
    if (activePlayers.length < 2) return null;

    // Reset player states
    game.players.forEach(player => {
      player.cards = [];
      player.bet = 0;
      player.isFolded = false;
      player.isAllIn = false;
      player.lastAction = undefined;
      player.isDealer = false;
      player.isSmallBlind = false;
      player.isBigBlind = false;
    });

    // Reset game state
    game.communityCards = [];
    game.pots = [{ amount: 0, eligiblePlayers: activePlayers.map(p => p.odiserId) }];
    game.currentBet = 0;
    game.minRaise = game.bigBlind;
    game.actions = [];
    game.handNumber++;

    // Move dealer button
    const seats = Array.from(game.players.keys()).sort((a, b) => a - b);
    const currentDealerIndex = seats.indexOf(game.dealerSeat);
    const newDealerIndex = currentDealerIndex === -1 ? 0 : (currentDealerIndex + 1) % seats.length;
    game.dealerSeat = seats[newDealerIndex];

    // Set blinds
    const dealerIndex = seats.indexOf(game.dealerSeat);
    if (activePlayers.length === 2) {
      // Heads up - dealer is small blind
      game.smallBlindSeat = game.dealerSeat;
      game.bigBlindSeat = seats[(dealerIndex + 1) % seats.length];
    } else {
      game.smallBlindSeat = seats[(dealerIndex + 1) % seats.length];
      game.bigBlindSeat = seats[(dealerIndex + 2) % seats.length];
    }

    // Mark dealer and blinds
    const dealer = game.players.get(game.dealerSeat);
    const smallBlind = game.players.get(game.smallBlindSeat);
    const bigBlind = game.players.get(game.bigBlindSeat);

    if (dealer) dealer.isDealer = true;
    if (smallBlind) {
      smallBlind.isSmallBlind = true;
      this.postBlind(game, smallBlind, game.smallBlind);
    }
    if (bigBlind) {
      bigBlind.isBigBlind = true;
      this.postBlind(game, bigBlind, game.bigBlind);
    }

    game.currentBet = game.bigBlind;

    // Create and shuffle deck
    const deck = shuffleDeck(createDeck());
    this.decks.set(tableId, deck);

    // Deal cards
    this.dealHoleCards(game, deck);

    // Set phase to preflop
    game.phase = 'preflop';

    // Set first to act (left of big blind)
    const bigBlindIndex = seats.indexOf(game.bigBlindSeat);
    game.currentPlayerSeat = seats[(bigBlindIndex + 1) % seats.length];
    game.turnStartTime = Date.now();

    return game;
  }

  // Post blind
  private postBlind(game: GameState, player: PlayerState, amount: number): void {
    const actualAmount = Math.min(amount, player.stack);
    player.bet = actualAmount;
    player.stack -= actualAmount;
    game.pots[0].amount += actualAmount;

    if (player.stack === 0) {
      player.isAllIn = true;
    }
  }

  // Deal hole cards
  private dealHoleCards(game: GameState, deck: Card[]): void {
    const activePlayers = this.getActivePlayers(game);
    
    // Deal 2 cards to each player
    for (let round = 0; round < 2; round++) {
      for (const player of activePlayers) {
        player.cards.push(deck.pop()!);
      }
    }
  }

  // Deal community cards
  private dealCommunityCards(game: GameState, count: number): void {
    const deck = this.decks.get(game.tableId);
    if (!deck) return;

    // Burn one card
    deck.pop();

    // Deal community cards
    for (let i = 0; i < count; i++) {
      game.communityCards.push(deck.pop()!);
    }
  }

  // Process player action
  processAction(tableId: string, odiserId: string, action: ActionType, amount?: number): { success: boolean; error?: string; nextPhase?: boolean } {
    const game = this.activeGames.get(tableId);
    if (!game) return { success: false, error: 'Game not found' };

    const player = Array.from(game.players.values()).find(p => p.odiserId === odiserId);
    if (!player) return { success: false, error: 'Player not in game' };

    if (player.seatNumber !== game.currentPlayerSeat) {
      return { success: false, error: 'Not your turn' };
    }

    if (player.isFolded || player.isAllIn || player.isSittingOut) {
      return { success: false, error: 'Cannot act' };
    }

    const toCall = game.currentBet - player.bet;

    switch (action) {
      case 'fold':
        player.isFolded = true;
        player.lastAction = 'fold';
        break;

      case 'check':
        if (toCall > 0) {
          return { success: false, error: 'Cannot check, must call or fold' };
        }
        player.lastAction = 'check';
        break;

      case 'call':
        const callAmount = Math.min(toCall, player.stack);
        player.bet += callAmount;
        player.stack -= callAmount;
        game.pots[0].amount += callAmount;
        player.lastAction = `call ${callAmount}`;
        
        if (player.stack === 0) {
          player.isAllIn = true;
        }
        break;

      case 'bet':
        if (game.currentBet > 0) {
          return { success: false, error: 'Cannot bet, must raise' };
        }
        if (!amount || amount < game.bigBlind) {
          return { success: false, error: 'Bet too small' };
        }
        if (amount > player.stack) {
          return { success: false, error: 'Not enough chips' };
        }

        player.bet = amount;
        player.stack -= amount;
        game.pots[0].amount += amount;
        game.currentBet = amount;
        game.minRaise = amount;
        player.lastAction = `bet ${amount}`;

        if (player.stack === 0) {
          player.isAllIn = true;
        }
        break;

      case 'raise':
        const raiseAmount = amount || 0;
        const minRaiseTotal = game.currentBet + game.minRaise;
        
        if (raiseAmount < minRaiseTotal && raiseAmount < player.stack + player.bet) {
          return { success: false, error: `Minimum raise is ${minRaiseTotal}` };
        }
        
        const actualRaise = Math.min(raiseAmount, player.stack + player.bet);
        const additionalAmount = actualRaise - player.bet;
        
        game.minRaise = actualRaise - game.currentBet;
        game.currentBet = actualRaise;
        player.stack -= additionalAmount;
        game.pots[0].amount += additionalAmount;
        player.bet = actualRaise;
        player.lastAction = `raise to ${actualRaise}`;

        if (player.stack === 0) {
          player.isAllIn = true;
        }
        break;

      case 'allin':
        const allInAmount = player.stack + player.bet;
        const allInAdditional = player.stack;
        
        if (allInAmount > game.currentBet) {
          game.minRaise = Math.max(game.minRaise, allInAmount - game.currentBet);
          game.currentBet = allInAmount;
        }
        
        game.pots[0].amount += allInAdditional;
        player.bet = allInAmount;
        player.stack = 0;
        player.isAllIn = true;
        player.lastAction = `all-in ${allInAmount}`;
        break;

      default:
        return { success: false, error: 'Unknown action' };
    }

    // Record action
    game.actions.push({
      odiserId,
      action,
      amount,
      timestamp: Date.now(),
    });

    // Check if betting round is complete
    const bettingComplete = this.isBettingComplete(game);
    
    if (bettingComplete) {
      this.advancePhase(game);
      return { success: true, nextPhase: true };
    }

    // Move to next player
    game.currentPlayerSeat = this.getNextActiveSeat(game, player.seatNumber);
    game.turnStartTime = Date.now();

    return { success: true };
  }

  // Check if betting round is complete
  private isBettingComplete(game: GameState): boolean {
    const activePlayers = this.getActivePlayers(game);
    const playersCanAct = activePlayers.filter(p => !p.isAllIn);
    
    // Only one player left (everyone else folded)
    if (activePlayers.length === 1) return true;
    
    // No one can act (all all-in or folded)
    if (playersCanAct.length === 0) return true;
    
    // Check if all players who can act have matched the current bet
    const allMatched = playersCanAct.every(p => p.bet === game.currentBet);
    const allHaveActed = playersCanAct.every(p => p.lastAction !== undefined);
    
    // In preflop, big blind gets option to raise even if all called
    if (game.phase === 'preflop' && allMatched) {
      const bigBlind = game.players.get(game.bigBlindSeat);
      if (bigBlind && !bigBlind.isFolded && !bigBlind.isAllIn && game.currentBet === game.bigBlind) {
        // Check if action has gone around
        const bbHasActed = game.actions.some(a => a.odiserId === bigBlind.odiserId);
        if (!bbHasActed) return false;
      }
    }
    
    return allMatched && allHaveActed;
  }

  // Advance to next phase
  private advancePhase(game: GameState): void {
    const activePlayers = this.getActivePlayers(game);
    
    // Check for winner by fold
    if (activePlayers.length === 1) {
      this.endHand(game, [activePlayers[0]], false);
      return;
    }

    // Reset bets for new round
    game.players.forEach(p => {
      p.bet = 0;
      if (!p.isFolded && !p.isAllIn) {
        p.lastAction = undefined;
      }
    });
    game.currentBet = 0;
    game.minRaise = game.bigBlind;

    switch (game.phase) {
      case 'preflop':
        game.phase = 'flop';
        this.dealCommunityCards(game, 3);
        break;
      case 'flop':
        game.phase = 'turn';
        this.dealCommunityCards(game, 1);
        break;
      case 'turn':
        game.phase = 'river';
        this.dealCommunityCards(game, 1);
        break;
      case 'river':
        game.phase = 'showdown';
        this.determineWinners(game);
        return;
    }

    // Set first to act (left of dealer)
    const seats = Array.from(game.players.keys()).sort((a, b) => a - b);
    const dealerIndex = seats.indexOf(game.dealerSeat);
    game.currentPlayerSeat = this.getNextActiveSeat(game, game.dealerSeat);
    game.turnStartTime = Date.now();

    // If only all-in players left, run out community cards
    const playersCanAct = activePlayers.filter(p => !p.isAllIn);
    if (playersCanAct.length <= 1) {
      this.advancePhase(game);
    }
  }

  // Determine winners at showdown
  private determineWinners(game: GameState): void {
    const activePlayers = this.getActivePlayers(game);
    
    // Evaluate all hands
    const playerHands: { player: PlayerState; evaluation: HandEvaluation }[] = [];
    
    for (const player of activePlayers) {
      const evaluation = evaluateHand(player.cards, game.communityCards);
      playerHands.push({ player, evaluation });
    }

    // Sort by hand strength
    playerHands.sort((a, b) => compareHands(b.evaluation, a.evaluation));

    // Find winners (might be multiple in case of tie)
    const bestValue = playerHands[0].evaluation.value;
    const winners = playerHands
      .filter(ph => ph.evaluation.value === bestValue)
      .map(ph => ph.player);

    this.endHand(game, winners, true);
  }

  // End hand and distribute pot
  private endHand(game: GameState, winners: PlayerState[], showdown: boolean): void {
    const totalPot = game.pots.reduce((sum, pot) => sum + pot.amount, 0);
    const winAmount = Math.floor(totalPot / winners.length);
    const remainder = totalPot % winners.length;

    winners.forEach((winner, index) => {
      const extra = index === 0 ? remainder : 0;
      winner.stack += winAmount + extra;
    });

    game.phase = 'showdown';
  }

  // Get sanitized game state for client
  getClientGameState(tableId: string, odiserId?: string): ClientGameState | null {
    const game = this.activeGames.get(tableId);
    if (!game) return null;

    const players: ClientPlayerState[] = [];
    
    game.players.forEach((player, seat) => {
      const clientPlayer: ClientPlayerState = {
        odiserId: player.odiserId,
        odiserName: player.odiserName,
        odiserAvatar: player.odiserAvatar,
        seatNumber: player.seatNumber,
        stack: player.stack,
        bet: player.bet,
        hasCards: player.cards.length > 0,
        cardCount: player.cards.length,
        isActive: player.isActive,
        isFolded: player.isFolded,
        isAllIn: player.isAllIn,
        isSittingOut: player.isSittingOut,
        isDealer: player.isDealer,
        isSmallBlind: player.isSmallBlind,
        isBigBlind: player.isBigBlind,
        lastAction: player.lastAction,
        isBot: player.isBot,
      };

      // Send cards only to the player themselves or at showdown
      if (player.odiserId === odiserId || game.phase === 'showdown') {
        clientPlayer.cards = player.cards;
      }

      players.push(clientPlayer);
    });

    return {
      id: game.id,
      tableId: game.tableId,
      phase: game.phase,
      players,
      communityCards: game.communityCards,
      pots: game.pots,
      currentBet: game.currentBet,
      minRaise: game.minRaise,
      dealerSeat: game.dealerSeat,
      currentPlayerSeat: game.currentPlayerSeat,
      turnStartTime: game.turnStartTime,
      turnTimeLimit: game.turnTimeLimit,
      handNumber: game.handNumber,
    };
  }

  // Check if it's player's turn
  isPlayerTurn(tableId: string, odiserId: string): boolean {
    const game = this.activeGames.get(tableId);
    if (!game) return false;

    const player = Array.from(game.players.values()).find(p => p.odiserId === odiserId);
    return player?.seatNumber === game.currentPlayerSeat;
  }

  // Get valid actions for player
  getValidActions(tableId: string, odiserId: string): { action: ActionType; minAmount?: number; maxAmount?: number }[] {
    const game = this.activeGames.get(tableId);
    if (!game) return [];

    const player = Array.from(game.players.values()).find(p => p.odiserId === odiserId);
    if (!player || player.seatNumber !== game.currentPlayerSeat) return [];
    if (player.isFolded || player.isAllIn) return [];

    const actions: { action: ActionType; minAmount?: number; maxAmount?: number }[] = [];
    const toCall = game.currentBet - player.bet;

    // Always can fold
    actions.push({ action: 'fold' });

    if (toCall === 0) {
      // Can check
      actions.push({ action: 'check' });
      
      // Can bet
      if (player.stack >= game.bigBlind) {
        actions.push({ 
          action: 'bet', 
          minAmount: game.bigBlind, 
          maxAmount: player.stack 
        });
      }
    } else {
      // Must call or raise
      if (toCall < player.stack) {
        actions.push({ action: 'call', minAmount: toCall, maxAmount: toCall });
        
        // Can raise
        const minRaise = game.currentBet + game.minRaise;
        if (player.stack + player.bet > minRaise) {
          actions.push({
            action: 'raise',
            minAmount: minRaise,
            maxAmount: player.stack + player.bet,
          });
        }
      }
    }

    // Always can go all-in
    if (player.stack > 0) {
      actions.push({ action: 'allin', minAmount: player.stack, maxAmount: player.stack });
    }

    return actions;
  }
}
