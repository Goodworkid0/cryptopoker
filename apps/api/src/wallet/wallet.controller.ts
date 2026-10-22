import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wallet balance' })
  getBalance(@Request() req: any) {
    return this.walletService.getBalance(req.user.id);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction history' })
  getTransactions(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.walletService.getTransactions(req.user.id, +page, +limit);
  }

  @Get('deposit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get deposit information' })
  getDepositInfo(@Request() req: any) {
    return this.walletService.initiateDeposit(req.user.id);
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request withdrawal' })
  requestWithdraw(
    @Request() req: any,
    @Body() body: { amount: string; toAddress: string },
  ) {
    return this.walletService.requestWithdraw(req.user.id, body.amount, body.toAddress);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wallet statistics' })
  getStats(@Request() req: any) {
    return this.walletService.getWalletStats(req.user.id);
  }

  @Post('faucet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get free test PKC (development only)' })
  claimFaucet(@Request() req: any) {
    return this.walletService.claimFaucet(req.user.id);
  }
}
