-- CreateTable
CREATE TABLE "SessionProfile" (
    "sessionId" TEXT NOT NULL,
    "email" TEXT,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT false,
    "emailCapturedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionProfile_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" UUID NOT NULL,
    "sessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionProfile_unsubscribeToken_key" ON "SessionProfile"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "EmailLog_sessionId_idx" ON "EmailLog"("sessionId");

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SessionProfile"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
