import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SiweMessage, generateNonce } from 'siwe';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, WalletLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private nonceStore: Map<string, { nonce: string; expiresAt: Date }> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user with wallet
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        wallet: {
          create: {},
        },
      },
      include: {
        wallet: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.emailOrUsername },
          { username: dto.emailOrUsername },
        ],
      },
      include: {
        wallet: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Account is banned');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // Web3 Authentication
  async getNonce(address: string) {
    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    this.nonceStore.set(address.toLowerCase(), { nonce, expiresAt });

    return { nonce };
  }

  async walletLogin(dto: WalletLoginDto) {
    const { message, signature } = dto;

    try {
      const siweMessage = new SiweMessage(message);
      const { address } = siweMessage;

      // Verify nonce
      const stored = this.nonceStore.get(address.toLowerCase());
      if (!stored || stored.nonce !== siweMessage.nonce) {
        throw new UnauthorizedException('Invalid nonce');
      }

      if (new Date() > stored.expiresAt) {
        throw new UnauthorizedException('Nonce expired');
      }

      // Verify signature
      await siweMessage.verify({ signature });

      // Clear nonce
      this.nonceStore.delete(address.toLowerCase());

      // Find or create user
      let user = await this.prisma.user.findUnique({
        where: { walletAddress: address },
        include: { wallet: true },
      });

      if (!user) {
        // Create new user with wallet
        user = await this.prisma.user.create({
          data: {
            username: `player_${address.slice(2, 8)}`,
            walletAddress: address,
            wallet: {
              create: {},
            },
          },
          include: { wallet: true },
        });
      }

      if (user.isBanned) {
        throw new UnauthorizedException('Account is banned');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid signature');
    }
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(userId);
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    // Store session
    await this.prisma.session.create({
      data: {
        userId,
        token: accessToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      return null;
    }

    return this.sanitizeUser(user);
  }
}
