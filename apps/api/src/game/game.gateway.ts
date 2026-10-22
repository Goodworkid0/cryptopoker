import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { BotService, BOT_PERSONALITIES } from './bot.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActionType, PlayerState } from './game.types';

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
    username?: string;
    tableId?: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private playerSockets: Map<string, AuthenticatedSocket> = new Map();
  private tableSubscribers: Map<string, Set<string>> = new Map(); // tableId -> Set<odiserId>
  private botTimers: Map<string, NodeJS.Timeout> = new Map(); // tableId -> bot action timer

  constructor(
    private gameService: GameService,
    private botService: BotService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Get session from handshake
      const sessionId = client.handshake.auth?.sessionId;
      const userId = client.handshake.auth?.userId;
      const username = client.handshake.auth?.username;

      if (userId && username) {
        client.data.userId = userId;
        client.data.username = username;
        this.playerSockets.set(userId, client);
        console.log(`Player connected: ${username} (${userId})`);
        
        client.emit('connected', { userId, username });
      } else {
        // Allow spectators without auth
        console.log(`Spectator connected: ${client.id}`);
        client.emit('connected', { spectator: true });
      }
    } catch (error) {
      console.error('Connection error:', error);
      client.emit('error', { message: 'Connection failed' });
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    const tableId = client.data.tableId;

    if (userId) {
      this.playerSockets.delete(userId);
      
      // Remove from table subscribers
      if (tableId) {
        this.tableSubscribers.get(tableId)?.delete(userId);
      }
      
      console.log(`Player disconnected: ${client.data.username}`);
    }
  }

  @SubscribeMessage('joinTable')
  async handleJoinTable(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tableId: string; seatNumber?: number; buyIn?: number },
  ) {
    const { tableId, seatNumber, buyIn } = data;
    const userId = client.data.userId;

    // Join room for updates
    client.join(`table:${tableId}`);
    client.data.tableId = tableId;

    // Add to subscribers
    if (!this.tableSubscribers.has(tableId)) {
      this.tableSubscribers.set(tableId, new Set());
    }
    if (userId) {
      this.tableSubscribers.get(tableId)?.add(userId);
    }

    // Get or create game
    let gameState = this.gameService.getGameState(tableId);
    
    if (!gameState) {
      // Fetch table info from database
      const table = await this.prisma.table.findUnique({
        where: { id: tableId },
      });
      
      if (!table) {
        client.emit('error', { message: 'Table not found' });
        return;
      }

      gameState = await this.gameService.createGame(
        tableId,
        Number(table.smallBlind),
        Number(table.bigBlind),
      );
    }

    // If player wants to sit down
    if (userId && seatNumber !== undefined && buyIn !== undefined) {
      // Check if seat is available
      const existingPlayer = gameState.players.get(seatNumber);
      if (existingPlayer) {
        client.emit('error', { message: 'Seat is taken' });
        return;
      }

      // Fetch user info
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      if (!user) {
        client.emit('error', { message: 'User not found' });
        return;
      }

      // Check balance
      const availableBalance = Number(user.wallet?.balance || 0) - Number(user.wallet?.lockedBalance || 0);
      if (buyIn > availableBalance) {
        client.emit('error', { message: 'Insufficient balance' });
        return;
      }

      // Lock buy-in
      await this.prisma.wallet.update({
        where: { userId },
        data: {
          lockedBalance: { increment: buyIn },
        },
      });

      // Add player to game
      const playerState: PlayerState = {
        odiserId: userId,
        odiserName: user.username,
        odiserAvatar: user.avatar || undefined,
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
        timeBank: 30,
      };

      this.gameService.addPlayer(tableId, playerState);

      // Notify all players
      this.server.to(`table:${tableId}`).emit('playerJoined', {
        odiserId: userId,
        odiserName: user.username,
        seatNumber,
        stack: buyIn,
      });

      // Check if we can start the game
      const activePlayers = Array.from(gameState.players.values()).filter(p => !p.isSittingOut);
      if (activePlayers.length >= 2 && gameState.phase === 'waiting') {
        setTimeout(() => this.startNewHand(tableId), 2000);
      }
    }

    // Send current game state to the joining client
    const clientState = this.gameService.getClientGameState(tableId, userId);
    client.emit('gameState', clientState);
  }

  @SubscribeMessage('leaveTable')
  async handleLeaveTable(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tableId: string },
  ) {
    const { tableId } = data;
    const userId = client.data.userId;

    if (!userId) return;

    const gameState = this.gameService.getGameState(tableId);
    if (!gameState) return;

    // Find player's seat
    let playerSeat: number | undefined;
    gameState.players.forEach((p, seat) => {
      if (p.odiserId === userId) playerSeat = seat;
    });

    if (playerSeat === undefined) return;

    const player = this.gameService.removePlayer(tableId, playerSeat);
    
    if (player) {
      // Return remaining stack to wallet
      await this.prisma.wallet.update({
        where: { userId },
        data: {
          lockedBalance: { decrement: player.stack },
        },
      });

      // Notify others
      this.server.to(`table:${tableId}`).emit('playerLeft', {
        odiserId: userId,
        seatNumber: playerSeat,
      });
    }

    client.leave(`table:${tableId}`);
    this.tableSubscribers.get(tableId)?.delete(userId);
    client.data.tableId = undefined;
  }

  @SubscribeMessage('sitOut')
  handleSitOut(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tableId: string; sitOut: boolean },
  ) {
    const { tableId, sitOut } = data;
    const userId = client.data.userId;

    if (!userId) return;

    const gameState = this.gameService.getGameState(tableId);
    if (!gameState) return;

    const player = Array.from(gameState.players.values()).find(p => p.odiserId === userId);
    if (player) {
      player.isSittingOut = sitOut;
      
      this.server.to(`table:${tableId}`).emit('playerSitOut', {
        odiserId: userId,
        sitOut,
      });
    }
  }

  @SubscribeMessage('playerAction')
  handlePlayerAction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tableId: string; action: ActionType; amount?: number },
  ) {
    const { tableId, action, amount } = data;
    const userId = client.data.userId;

    if (!userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const result = this.gameService.processAction(tableId, userId, action, amount);

    if (!result.success) {
      client.emit('error', { message: result.error });
      return;
    }

    // Broadcast action to all players
    this.server.to(`table:${tableId}`).emit('action', {
      odiserId: userId,
      action,
      amount,
      timestamp: Date.now(),
    });

    // Send updated game state
    this.broadcastGameState(tableId);
    
    // Check if next player is a bot
    this.scheduleBotAction(tableId);

    // If phase advanced, might need to deal cards or determine winner
    if (result.nextPhase) {
      const gameState = this.gameService.getGameState(tableId);
      if (gameState?.phase === 'showdown') {
        // Short delay then start new hand
        setTimeout(() => this.startNewHand(tableId), 5000);
      }
    }
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tableId: string; message: string },
  ) {
    const { tableId, message } = data;
    const userId = client.data.userId;
    const username = client.data.username;

    this.server.to(`table:${tableId}`).emit('chatMessage', {
      odiserId: userId,
      username: username || 'Spectator',
      message: message.slice(0, 200), // Limit message length
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('getValidActions')
  handleGetValidActions(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tableId: string },
  ) {
    const { tableId } = data;
    const userId = client.data.userId;

    if (!userId) return;

    const actions = this.gameService.getValidActions(tableId, userId);
    client.emit('validActions', actions);
  }

  // Helper methods
  private startNewHand(tableId: string) {
    const gameState = this.gameService.startHand(tableId);
    
    if (gameState) {
      this.server.to(`table:${tableId}`).emit('newHand', {
        handNumber: gameState.handNumber,
        dealerSeat: gameState.dealerSeat,
        smallBlindSeat: gameState.smallBlindSeat,
        bigBlindSeat: gameState.bigBlindSeat,
      });

      this.broadcastGameState(tableId);
      
      // Check if current player is a bot
      this.scheduleBotAction(tableId);
    }
  }

  private broadcastGameState(tableId: string) {
    const subscribers = this.tableSubscribers.get(tableId);
    const gameState = this.gameService.getGameState(tableId);
    
    if (subscribers) {
      // Send personalized state to each player
      subscribers.forEach(odiserId => {
        const socket = this.playerSockets.get(odiserId);
        if (socket) {
          const clientState = this.gameService.getClientGameState(tableId, odiserId);
          socket.emit('gameState', clientState);
          
          // Also send valid actions if it's this player's turn
          if (gameState) {
            const player = Array.from(gameState.players.values()).find(p => p.odiserId === odiserId);
            if (player && player.seatNumber === gameState.currentPlayerSeat) {
              const validActions = this.gameService.getValidActions(tableId, odiserId);
              socket.emit('validActions', validActions);
            }
          }
        }
      });
    }

    // Send generic state to spectators (in the room but not subscribed as players)
    const spectatorState = this.gameService.getClientGameState(tableId);
    this.server.to(`table:${tableId}`).emit('spectatorState', spectatorState);
  }

  // Emit to specific player
  emitToPlayer(odiserId: string, event: string, data: any) {
    const socket = this.playerSockets.get(odiserId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  // Emit to table
  emitToTable(tableId: string, event: string, data: any) {
    this.server.to(`table:${tableId}`).emit(event, data);
  }

  // Add bot to table
  @SubscribeMessage('addBot')
  async handleAddBot(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tableId: string; seatNumber: number; botType?: string; buyIn?: number },
  ) {
    const { tableId, seatNumber, botType = 'balanced', buyIn = 10000 } = data;
    
    const gameState = this.gameService.getGameState(tableId);
    if (!gameState) {
      client.emit('error', { message: 'Game not found' });
      return;
    }

    // Check if seat is available
    if (gameState.players.has(seatNumber)) {
      client.emit('error', { message: 'Seat is taken' });
      return;
    }

    const personality = BOT_PERSONALITIES[botType] || BOT_PERSONALITIES['balanced'];
    const bot = await this.botService.addBotToTable(tableId, seatNumber, personality, buyIn);

    if (bot) {
      this.server.to(`table:${tableId}`).emit('playerJoined', {
        odiserId: bot.odiserId,
        odiserName: bot.odiserUsername,
        odiserUsername: bot.odiserUsername,
        seatNumber,
        stack: buyIn,
        isBot: true,
      });

      // Check if we can start game
      const activePlayers = Array.from(gameState.players.values()).filter(p => !p.isSittingOut);
      if (activePlayers.length >= 2 && gameState.phase === 'waiting') {
        setTimeout(() => this.startNewHand(tableId), 2000);
      }

      this.broadcastGameState(tableId);
    }
  }

  // Remove bot from table
  @SubscribeMessage('removeBot')
  handleRemoveBot(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tableId: string; seatNumber: number },
  ) {
    const { tableId, seatNumber } = data;
    
    const gameState = this.gameService.getGameState(tableId);
    if (!gameState) return;

    const player = gameState.players.get(seatNumber);
    if (!player || !player.isBot) {
      client.emit('error', { message: 'No bot at this seat' });
      return;
    }

    this.botService.removeBot(player.odiserId);
    this.gameService.removePlayer(tableId, seatNumber);

    this.server.to(`table:${tableId}`).emit('playerLeft', {
      odiserId: player.odiserId,
      seatNumber,
    });

    this.broadcastGameState(tableId);
  }

  // Process bot action when it's their turn
  private scheduleBotAction(tableId: string) {
    // Clear any existing timer
    const existingTimer = this.botTimers.get(tableId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const gameState = this.gameService.getGameState(tableId);
    if (!gameState || gameState.phase === 'waiting' || gameState.phase === 'showdown') {
      return;
    }

    const currentPlayer = gameState.players.get(gameState.currentPlayerSeat);
    if (!currentPlayer || !currentPlayer.isBot) {
      return;
    }

    // Bot "thinks" for 1-3 seconds
    const thinkTime = 1000 + Math.random() * 2000;

    const timer = setTimeout(() => {
      this.processBotAction(tableId, currentPlayer.odiserId);
    }, thinkTime);

    this.botTimers.set(tableId, timer);
  }

  private processBotAction(tableId: string, botId: string) {
    const decision = this.botService.getBotDecision(tableId, botId);
    
    const result = this.gameService.processAction(tableId, botId, decision.action, decision.amount);

    if (result.success) {
      // Broadcast the action
      this.server.to(`table:${tableId}`).emit('action', {
        odiserId: botId,
        action: decision.action,
        amount: decision.amount,
        timestamp: Date.now(),
      });

      this.broadcastGameState(tableId);

      // Check if another bot needs to act
      const gameState = this.gameService.getGameState(tableId);
      if (gameState && gameState.phase !== 'waiting' && gameState.phase !== 'showdown') {
        this.scheduleBotAction(tableId);
      }

      // If showdown, start new hand after delay
      if (result.nextPhase && gameState?.phase === 'showdown') {
        setTimeout(() => this.startNewHand(tableId), 5000);
      }
    }
  }
}
