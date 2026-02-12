-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "ratingOverall" INTEGER NOT NULL,
    "procedure" TEXT,
    "visitMonth" INTEGER,
    "visitYear" INTEGER,
    "headline" TEXT,
    "body" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_clinicId_idx" ON "Review"("clinicId");

-- CreateIndex
CREATE INDEX "Review_sessionId_idx" ON "Review"("sessionId");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_clinicId_sessionId_key" ON "Review"("clinicId", "sessionId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
