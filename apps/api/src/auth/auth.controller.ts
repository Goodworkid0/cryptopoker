import { Controller, Post, Body, Get, Query, UseGuards, Request, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, WalletLoginDto } from './dto/auth.dto';
import { SessionAuthGuard } from './guards/session-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterDto,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    
    // Set session
    req.session.userId = result.user.id;
    req.session.user = result.user;
    
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email/username and password' })
  async login(
    @Body() dto: LoginDto,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    
    // Set session
    req.session.userId = result.user.id;
    req.session.user = result.user;
    
    return result;
  }

  @Get('nonce')
  @ApiOperation({ summary: 'Get nonce for wallet authentication' })
  getNonce(@Query('address') address: string) {
    return this.authService.getNonce(address);
  }

  @Post('wallet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Web3 wallet' })
  async walletLogin(
    @Body() dto: WalletLoginDto,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.walletLogin(dto);
    
    // Set session
    req.session.userId = result.user.id;
    req.session.user = result.user;
    
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout and destroy session' })
  async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err: any) => {
        if (err) {
          reject(err);
        }
        res.clearCookie('cryptopoker.sid');
        resolve({ message: 'Logged out successfully' });
      });
    });
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@Request() req: any) {
    // Refresh user data from database
    const user = await this.authService.getUserById(req.session.userId);
    
    // Update session with fresh data
    req.session.user = user;
    
    return { user };
  }

  @Get('session')
  @ApiOperation({ summary: 'Check if session is valid' })
  checkSession(@Request() req: any) {
    if (req.session?.userId) {
      return { 
        authenticated: true, 
        user: req.session.user 
      };
    }
    return { authenticated: false };
  }
}
