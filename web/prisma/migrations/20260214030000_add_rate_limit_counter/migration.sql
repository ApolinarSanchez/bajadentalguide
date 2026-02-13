-- CreateTable
CREATE TABLE "RateLimitCounter" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitCounter_key_action_windowStart_key" ON "RateLimitCounter"("key", "action", "windowStart");

-- CreateIndex
CREATE INDEX "RateLimitCounter_key_action_idx" ON "RateLimitCounter"("key", "action");
