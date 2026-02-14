-- CreateEnum
CREATE TYPE "ClinicClaimRequestStatus" AS ENUM ('PENDING', 'PROCESSED');

-- CreateTable
CREATE TABLE "ClinicClaimRequest" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "message" TEXT,
    "status" "ClinicClaimRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicClaimRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicClaimRequest_clinicId_idx" ON "ClinicClaimRequest"("clinicId");

-- CreateIndex
CREATE INDEX "ClinicClaimRequest_status_createdAt_idx" ON "ClinicClaimRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ClinicClaimRequest" ADD CONSTRAINT "ClinicClaimRequest_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
