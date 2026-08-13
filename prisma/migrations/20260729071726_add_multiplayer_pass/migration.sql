-- CreateEnum
CREATE TYPE "PassStatus" AS ENUM ('PENDING', 'ACTIVE', 'FAILED');

-- CreateTable
CREATE TABLE "MultiplayerPass" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "apiRef" TEXT NOT NULL,
    "invoiceId" TEXT,
    "status" "PassStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MultiplayerPass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MultiplayerPass_apiRef_key" ON "MultiplayerPass"("apiRef");

-- CreateIndex
CREATE INDEX "MultiplayerPass_phoneNumber_idx" ON "MultiplayerPass"("phoneNumber");
