import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { BotService } from './bot.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GameService, GameGateway, BotService],
  exports: [GameService, GameGateway, BotService],
})
export class GameModule {}
