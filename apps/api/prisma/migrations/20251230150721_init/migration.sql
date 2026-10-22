-- CreateEnum
CREATE TYPE "VipTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'GAME_BUY_IN', 'GAME_PAYOUT', 'TOURNAMENT_BUY_IN', 'TOURNAMENT_PAYOUT', 'RAKE', 'REWARD', 'REFERRAL_BONUS', 'STAKING_DEPOSIT', 'STAKING_WITHDRAW', 'STAKING_REWARD');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('TEXAS_HOLDEM', 'OMAHA', 'OMAHA_HI_LO');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('WAITING', 'ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'DEALING', 'PREFLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN', 'FINISHED');

-- CreateEnum
CREATE TYPE "PokerRound" AS ENUM ('PREFLOP', 'FLOP', 'TURN', 'RIVER');

-- CreateEnum
CREATE TYPE "PokerAction" AS ENUM ('FOLD', 'CHECK', 'CALL', 'BET', 'RAISE', 'ALL_IN', 'SMALL_BLIND', 'BIG_BLIND');

-- CreateEnum
CREATE TYPE "TournamentType" AS ENUM ('SIT_N_GO', 'MTT', 'FREEROLL', 'SATELLITE');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('REGISTERING', 'STARTING', 'RUNNING', 'FINAL_TABLE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('HANDS_PLAYED', 'HANDS_WON', 'TOURNAMENTS_PLAYED', 'TOURNAMENTS_WON', 'TOTAL_WINNINGS', 'ROYAL_FLUSH', 'STRAIGHT_FLUSH', 'FOUR_OF_A_KIND', 'FULL_HOUSE', 'CONSECUTIVE_WINS', 'LOGIN_STREAK');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('DAILY_BONUS', 'WEEKLY_BONUS', 'ACHIEVEMENT', 'RAKEBACK', 'LEADERBOARD', 'REFERRAL', 'PROMOTION', 'VIP_REWARD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT,
    "walletAddress" TEXT,
    "avatar" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "vipTier" "VipTier" NOT NULL DEFAULT 'BRONZE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "lockedBalance" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "stakingBalance" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "totalDeposited" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "totalWithdrawn" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "totalWon" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "totalLost" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "totalRakePaid" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(36,18) NOT NULL,
    "fee" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "txHash" TEXT,
    "blockNumber" INTEGER,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GameType" NOT NULL DEFAULT 'TEXAS_HOLDEM',
    "smallBlind" DECIMAL(36,18) NOT NULL,
    "bigBlind" DECIMAL(36,18) NOT NULL,
    "minBuyIn" DECIMAL(36,18) NOT NULL,
    "maxBuyIn" DECIMAL(36,18) NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 9,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "status" "TableStatus" NOT NULL DEFAULT 'WAITING',
    "currentPlayers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "currentRound" "PokerRound",
    "pot" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "rake" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "communityCards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dealerSeat" INTEGER NOT NULL DEFAULT 0,
    "currentSeat" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seatNumber" INTEGER NOT NULL,
    "stackSize" DECIMAL(36,18) NOT NULL,
    "currentBet" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "holeCards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFolded" BOOLEAN NOT NULL DEFAULT false,
    "isAllIn" BOOLEAN NOT NULL DEFAULT false,
    "winnings" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "handRank" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAction" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "action" "PokerAction" NOT NULL,
    "amount" DECIMAL(36,18),
    "round" "PokerRound" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "TournamentType" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'REGISTERING',
    "buyIn" DECIMAL(36,18) NOT NULL,
    "entryFee" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "rebuyAllowed" BOOLEAN NOT NULL DEFAULT false,
    "rebuyCount" INTEGER NOT NULL DEFAULT 0,
    "startingChips" INTEGER NOT NULL,
    "blindStructure" JSONB NOT NULL,
    "levelDuration" INTEGER NOT NULL,
    "minPlayers" INTEGER NOT NULL DEFAULT 2,
    "maxPlayers" INTEGER NOT NULL,
    "currentPlayers" INTEGER NOT NULL DEFAULT 0,
    "prizePool" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "prizeStructure" JSONB NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "lateRegMinutes" INTEGER NOT NULL DEFAULT 60,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentPlayer" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chips" INTEGER NOT NULL,
    "position" INTEGER,
    "prize" DECIMAL(36,18),
    "isEliminated" BOOLEAN NOT NULL DEFAULT false,
    "eliminatedAt" TIMESTAMP(3),
    "rebuys" INTEGER NOT NULL DEFAULT 0,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "type" "AchievementType" NOT NULL,
    "target" INTEGER NOT NULL,
    "reward" DECIMAL(36,18) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RewardType" NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "description" TEXT,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "referrerBonus" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "referredBonus" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_txHash_idx" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_type_status_idx" ON "Transaction"("type", "status");

-- CreateIndex
CREATE INDEX "Table_status_idx" ON "Table"("status");

-- CreateIndex
CREATE INDEX "Table_type_idx" ON "Table"("type");

-- CreateIndex
CREATE INDEX "Game_tableId_idx" ON "Game"("tableId");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "GamePlayer_userId_idx" ON "GamePlayer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_gameId_seatNumber_key" ON "GamePlayer"("gameId", "seatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_gameId_userId_key" ON "GamePlayer"("gameId", "userId");

-- CreateIndex
CREATE INDEX "GameAction_gameId_idx" ON "GameAction"("gameId");

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");

-- CreateIndex
CREATE INDEX "Tournament_scheduledStart_idx" ON "Tournament"("scheduledStart");

-- CreateIndex
CREATE INDEX "TournamentPlayer_tournamentId_idx" ON "TournamentPlayer"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentPlayer_tournamentId_userId_key" ON "TournamentPlayer"("tournamentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "Reward_userId_idx" ON "Reward"("userId");

-- CreateIndex
CREATE INDEX "Reward_type_idx" ON "Reward"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referredId_key" ON "Referral"("referredId");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_code_idx" ON "Referral"("code");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAction" ADD CONSTRAINT "GameAction_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPlayer" ADD CONSTRAINT "TournamentPlayer_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
