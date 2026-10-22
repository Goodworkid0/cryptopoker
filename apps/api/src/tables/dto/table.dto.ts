import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GameType {
  TEXAS_HOLDEM = 'TEXAS_HOLDEM',
  OMAHA = 'OMAHA',
}

export class CreateTableDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  type: GameType;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  smallBlind: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.02)
  bigBlind: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  minBuyIn: number;

  @ApiProperty()
  @IsNumber()
  maxBuyIn: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(2)
  @Max(10)
  maxPlayers?: number = 9;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean = false;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;
}

export class JoinTableDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  buyIn: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(9)
  seatNumber: number;
}
