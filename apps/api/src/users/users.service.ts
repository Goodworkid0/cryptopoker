import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { wallet: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatar: true,
        level: true,
        vipTier: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, data: { username?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        avatar: true,
        email: true,
        walletAddress: true,
        level: true,
        experience: true,
        vipTier: true,
      },
    });
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        gameHistory: {
          select: {
            winnings: true,
            isFolded: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const gamesPlayed = user.gameHistory.length;
    const gamesWon = user.gameHistory.filter(g => Number(g.winnings) > 0).length;

    return {
      level: user.level,
      experience: user.experience,
      vipTier: user.vipTier,
      gamesPlayed,
      gamesWon,
      winRate: gamesPlayed > 0 ? (gamesWon / gamesPlayed * 100).toFixed(2) : 0,
      totalWon: user.wallet?.totalWon || 0,
      totalLost: user.wallet?.totalLost || 0,
    };
  }

  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly') {
    const dateFilter = this.getDateFilter(period);

    return this.prisma.user.findMany({
      where: {
        wallet: {
          totalWon: { gt: 0 },
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        level: true,
        vipTier: true,
        wallet: {
          select: {
            totalWon: true,
          },
        },
      },
      orderBy: {
        wallet: {
          totalWon: 'desc',
        },
      },
      take: 100,
    });
  }

  private getDateFilter(period: string) {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.setDate(now.getDate() - 1));
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return new Date(0);
    }
  }
}
