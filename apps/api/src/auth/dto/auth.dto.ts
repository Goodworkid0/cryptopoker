import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}

export class LoginDto {
  @ApiProperty()
  @IsString()
  emailOrUsername: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class WalletLoginDto {
  @ApiProperty({ description: 'SIWE message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Wallet signature' })
  @IsString()
  signature: string;
}
