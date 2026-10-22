import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { type?: string; status?: string }) {
    return this.prisma.table.findMany({
      where: {
        ...(filters?.type && { type: filters.type as any }),
        ...(filters?.status && { status: filters.status as any }),
        status: { not: 'CLOSED' },
      },
      orderBy: [
        { currentPlayers: 'desc' },
        { bigBlind: 'asc' },
      ],
    });
  }

  async findById(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        games: {
          where: { status: { not: 'FINISHED' } },
          include: {
            players: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async create(dto: CreateTableDto) {
    return this.prisma.table.create({
      data: {
        name: dto.name,
        type: dto.type,
        smallBlind: dto.smallBlind,
        bigBlind: dto.bigBlind,
        minBuyIn: dto.minBuyIn,
        maxBuyIn: dto.maxBuyIn,
        maxPlayers: dto.maxPlayers,
        isPrivate: dto.isPrivate,
        password: dto.password,
      },
    });
  }

  async joinTable(tableId: string, userId: string, buyIn: number, seatNumber: number) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    if (table.currentPlayers >= table.maxPlayers) {
      throw new BadRequestException('Table is full');
    }

    if (buyIn < Number(table.minBuyIn) || buyIn > Number(table.maxBuyIn)) {
      throw new BadRequestException('Invalid buy-in amount');
    }

    // Check user balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || Number(wallet.balance) - Number(wallet.lockedBalance) < buyIn) {
      throw new BadRequestException('Insufficient balance');
    }

    // Lock buy-in amount
    await this.prisma.wallet.update({
      where: { userId },
      data: {
        lockedBalance: { increment: buyIn },
      },
    });

    // Update table player count
    await this.prisma.table.update({
      where: { id: tableId },
      data: {
        currentPlayers: { increment: 1 },
        status: 'ACTIVE',
      },
    });

    return { success: true, seatNumber };
  }

  async leaveTable(tableId: string, userId: string) {
    await this.prisma.table.update({
      where: { id: tableId },
      data: {
        currentPlayers: { decrement: 1 },
      },
    });

    return { success: true };
  }
}
