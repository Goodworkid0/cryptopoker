import { Controller, Get, Patch, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile/:username')
  @ApiOperation({ summary: 'Get public profile by username' })
  getProfile(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user stats' })
  getStats(@Request() req: any) {
    return this.usersService.getStats(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile' })
  updateProfile(
    @Request() req: any,
    @Body() data: { username?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, data);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard' })
  getLeaderboard(@Query('period') period: 'daily' | 'weekly' | 'monthly' | 'all') {
    return this.usersService.getLeaderboard(period);
  }
}
