import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { TablesGateway } from './tables.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cryptopoker-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [TablesService, TablesGateway],
  controllers: [TablesController],
  exports: [TablesService],
})
export class TablesModule {}
