import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WalletService {
  private provider: ethers.JsonRpcProvider;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.get('RPC_URL'),
    );
  }

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return {
      balance: wallet.balance.toString(),
      lockedBalance: wallet.lockedBalance.toString(),
      stakingBalance: wallet.stakingBalance.toString(),
      available: new Decimal(wallet.balance).minus(wallet.lockedBalance).toString(),
    };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async initiateDeposit(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Generate deposit address (in production, use HD wallet derivation)
    const depositAddress = this.configService.get('DEPOSIT_ADDRESS');

    return {
      depositAddress,
      minDeposit: '10',
      tokenAddress: this.configService.get('TOKEN_ADDRESS'),
      chainId: this.configService.get('CHAIN_ID'),
    };
  }

  async requestWithdraw(userId: string, amount: string, toAddress: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const amountDecimal = new Decimal(amount);
    const available = new Decimal(wallet.balance).minus(wallet.lockedBalance);

    if (amountDecimal.gt(available)) {
      throw new BadRequestException('Insufficient balance');
    }

    if (amountDecimal.lt(10)) {
      throw new BadRequestException('Minimum withdrawal is 10 PKC');
    }

    // Validate address
    if (!ethers.isAddress(toAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }

    // Create pending withdrawal
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'WITHDRAW',
        status: 'PENDING',
        amount: amountDecimal,
        toAddress,
        description: `Withdrawal to ${toAddress}`,
      },
    });

    // Lock the amount
    await this.prisma.wallet.update({
      where: { userId },
      data: {
        lockedBalance: { increment: amountDecimal },
      },
    });

    return {
      transactionId: transaction.id,
      status: 'PENDING',
      message: 'Withdrawal request submitted. Processing within 24 hours.',
    };
  }

  async getWalletStats(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return {
      totalDeposited: wallet.totalDeposited.toString(),
      totalWithdrawn: wallet.totalWithdrawn.toString(),
      totalWon: wallet.totalWon.toString(),
      totalLost: wallet.totalLost.toString(),
      totalRakePaid: wallet.totalRakePaid.toString(),
      netProfit: new Decimal(wallet.totalWon).minus(wallet.totalLost).toString(),
    };
  }

  // Faucet for testing - gives free PKC in development
  async claimFaucet(userId: string) {
    const FAUCET_AMOUNT = 10000; // 10,000 PKC for testing
    const COOLDOWN_HOURS = 24;

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    // Check for recent faucet claim (cooldown)
    const recentClaim = await this.prisma.transaction.findFirst({
      where: {
        userId,
        type: 'REWARD',
        description: 'Faucet claim',
        createdAt: {
          gte: new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000),
        },
      },
    });

    if (recentClaim) {
      const nextClaimTime = new Date(recentClaim.createdAt.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000);
      throw new BadRequestException(`Faucet cooldown active. Next claim available at ${nextClaimTime.toISOString()}`);
    }

    // Credit the faucet amount
    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: {
          balance: { increment: FAUCET_AMOUNT },
          totalDeposited: { increment: FAUCET_AMOUNT },
        },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          type: 'REWARD',
          amount: FAUCET_AMOUNT,
          status: 'COMPLETED',
          description: 'Faucet claim',
        },
      }),
    ]);

    return {
      message: `Successfully claimed ${FAUCET_AMOUNT} PKC!`,
      amount: FAUCET_AMOUNT,
      nextClaimAt: new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString(),
    };
  }
}
