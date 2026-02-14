-- CreateEnum
CREATE TYPE "ClinicEditSuggestionStatus" AS ENUM ('PENDING', 'APPLIED', 'REJECTED');

-- CreateTable
CREATE TABLE "ClinicEditSuggestion" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "suggestedPhone" TEXT,
    "suggestedWhatsapp" TEXT,
    "suggestedWebsiteUrl" TEXT,
    "suggestedYelpUrl" TEXT,
    "suggestedNote" TEXT,
    "contactEmail" TEXT,
    "status" "ClinicEditSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicEditSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicEditSuggestion_clinicId_idx" ON "ClinicEditSuggestion"("clinicId");

-- CreateIndex
CREATE INDEX "ClinicEditSuggestion_status_createdAt_idx" ON "ClinicEditSuggestion"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ClinicEditSuggestion" ADD CONSTRAINT "ClinicEditSuggestion_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
