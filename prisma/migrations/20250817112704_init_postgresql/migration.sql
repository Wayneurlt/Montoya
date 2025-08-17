-- CreateEnum
CREATE TYPE "public"."GameType" AS ENUM ('TRUTH_OR_DARE', 'DICE_OF_DESIRE', 'DO_OR_DRINK', 'NEVER_HAVE_I_EVER', 'MOST_LIKELY_TO', 'WOULD_YOU_RATHER');

-- CreateEnum
CREATE TYPE "public"."GameMode" AS ENUM ('FREE_FOR_ALL', 'RELATIONSHIP', 'TEAMS', 'ELIMINATION');

-- CreateEnum
CREATE TYPE "public"."GameTeam" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "public"."GameStatus" AS ENUM ('LOBBY', 'IN_PROGRESS', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."CardType" AS ENUM ('TRUTH', 'DARE', 'DO');

-- CreateEnum
CREATE TYPE "public"."GameEventType" AS ENUM ('JOIN_GAME', 'LEAVE_GAME', 'START_GAME', 'DRAW_CARD', 'COMPLETE_CHALLENGE', 'FAIL_CHALLENGE', 'TAKE_DRINK', 'REMOVE_CLOTHING', 'ELIMINATE_PLAYER', 'GAME_OVER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameSession" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "gameType" "public"."GameType" NOT NULL DEFAULT 'TRUTH_OR_DARE',
    "gameMode" "public"."GameMode" NOT NULL DEFAULT 'FREE_FOR_ALL',
    "status" "public"."GameStatus" NOT NULL DEFAULT 'LOBBY',
    "maxPlayers" INTEGER NOT NULL DEFAULT 8,
    "currentTurn" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "currentCardId" INTEGER,
    "currentTeam" "public"."GameTeam" DEFAULT 'A',

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameSessionUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameSessionId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "partnerId" INTEGER,
    "itemsRemoved" INTEGER NOT NULL DEFAULT 0,
    "drinksTaken" INTEGER NOT NULL DEFAULT 0,
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "isEliminated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "team" "public"."GameTeam",

    CONSTRAINT "GameSessionUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameHistory" (
    "id" SERIAL NOT NULL,
    "gameSessionId" INTEGER NOT NULL,
    "eventType" "public"."GameEventType" NOT NULL,
    "playerId" INTEGER,
    "targetPlayerId" INTEGER,
    "cardId" INTEGER,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionCardUsage" (
    "id" SERIAL NOT NULL,
    "gameSessionId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionCardUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameCard" (
    "id" SERIAL NOT NULL,
    "type" "public"."CardType" NOT NULL,
    "gameType" "public"."GameType" NOT NULL,
    "text" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL DEFAULT 1,
    "drinkAmount" TEXT,
    "targetGender" TEXT,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GroupGameQuestion" (
    "id" SERIAL NOT NULL,
    "gameType" "public"."GameType" NOT NULL,
    "text" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL DEFAULT 1,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GroupGameQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionGroupQuestionUsage" (
    "id" SERIAL NOT NULL,
    "gameSessionId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionGroupQuestionUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Analytics" (
    "id" SERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "page" TEXT,
    "game" TEXT,
    "data" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_code_key" ON "public"."GameSession"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_currentCardId_key" ON "public"."GameSession"("currentCardId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionUser_userId_gameSessionId_key" ON "public"."GameSessionUser"("userId", "gameSessionId");

-- CreateIndex
CREATE INDEX "GameHistory_gameSessionId_idx" ON "public"."GameHistory"("gameSessionId");

-- CreateIndex
CREATE INDEX "SessionCardUsage_gameSessionId_idx" ON "public"."SessionCardUsage"("gameSessionId");

-- CreateIndex
CREATE INDEX "SessionCardUsage_cardId_idx" ON "public"."SessionCardUsage"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionCardUsage_gameSessionId_cardId_key" ON "public"."SessionCardUsage"("gameSessionId", "cardId");

-- CreateIndex
CREATE INDEX "SessionGroupQuestionUsage_gameSessionId_idx" ON "public"."SessionGroupQuestionUsage"("gameSessionId");

-- CreateIndex
CREATE INDEX "SessionGroupQuestionUsage_questionId_idx" ON "public"."SessionGroupQuestionUsage"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionGroupQuestionUsage_gameSessionId_questionId_key" ON "public"."SessionGroupQuestionUsage"("gameSessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "public"."Admin"("username");

-- CreateIndex
CREATE INDEX "Analytics_eventType_idx" ON "public"."Analytics"("eventType");

-- CreateIndex
CREATE INDEX "Analytics_timestamp_idx" ON "public"."Analytics"("timestamp");

-- AddForeignKey
ALTER TABLE "public"."GameSession" ADD CONSTRAINT "GameSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSession" ADD CONSTRAINT "GameSession_currentCardId_fkey" FOREIGN KEY ("currentCardId") REFERENCES "public"."GameCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSessionUser" ADD CONSTRAINT "GameSessionUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSessionUser" ADD CONSTRAINT "GameSessionUser_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "public"."GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameHistory" ADD CONSTRAINT "GameHistory_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "public"."GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameHistory" ADD CONSTRAINT "GameHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."GameSessionUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameHistory" ADD CONSTRAINT "GameHistory_targetPlayerId_fkey" FOREIGN KEY ("targetPlayerId") REFERENCES "public"."GameSessionUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameHistory" ADD CONSTRAINT "GameHistory_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."GameCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionCardUsage" ADD CONSTRAINT "SessionCardUsage_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "public"."GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionCardUsage" ADD CONSTRAINT "SessionCardUsage_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."GameCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameCard" ADD CONSTRAINT "GameCard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionGroupQuestionUsage" ADD CONSTRAINT "SessionGroupQuestionUsage_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "public"."GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionGroupQuestionUsage" ADD CONSTRAINT "SessionGroupQuestionUsage_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."GroupGameQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
