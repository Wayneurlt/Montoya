-- CreateTable
CREATE TABLE "AgeConfirmation" (
    "id" SERIAL NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgeConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgeConfirmation_confirmedAt_idx" ON "AgeConfirmation"("confirmedAt");
