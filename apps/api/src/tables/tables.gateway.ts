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
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/poker',
})
export class TablesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private playerSockets: Map<string, Socket> = new Map();
  private tableRooms: Map<string, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      this.playerSockets.set(payload.sub, client);
      console.log(`Player connected: ${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.playerSockets.delete(client.data.userId);
      console.log(`Player disconnected: ${client.data.userId}`);
    }
  }

  @SubscribeMessage('joinTable')
  handleJoinTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string },
  ) {
    const { tableId } = data;
    client.join(`table:${tableId}`);

    if (!this.tableRooms.has(tableId)) {
      this.tableRooms.set(tableId, new Set());
    }
    this.tableRooms.get(tableId)?.add(client.data.userId);

    this.server.to(`table:${tableId}`).emit('playerJoined', {
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('leaveTable')
  handleLeaveTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string },
  ) {
    const { tableId } = data;
    client.leave(`table:${tableId}`);
    this.tableRooms.get(tableId)?.delete(client.data.userId);

    this.server.to(`table:${tableId}`).emit('playerLeft', {
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('playerAction')
  handlePlayerAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string; action: string; amount?: number },
  ) {
    const { tableId, action, amount } = data;

    // Broadcast action to all players at the table
    this.server.to(`table:${tableId}`).emit('gameAction', {
      userId: client.data.userId,
      action,
      amount,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string; message: string },
  ) {
    const { tableId, message } = data;

    this.server.to(`table:${tableId}`).emit('chatMessage', {
      userId: client.data.userId,
      message,
      timestamp: Date.now(),
    });
  }

  // Emit game state update to all players at a table
  emitGameState(tableId: string, gameState: any) {
    this.server.to(`table:${tableId}`).emit('gameState', gameState);
  }

  // Emit to specific player (for private info like hole cards)
  emitToPlayer(userId: string, event: string, data: any) {
    const socket = this.playerSockets.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }
}
