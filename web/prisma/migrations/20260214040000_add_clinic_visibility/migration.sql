-- AlterTable
ALTER TABLE "Clinic"
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing clinics based on direct contact availability
UPDATE "Clinic"
SET "isPublished" = true
WHERE ("phone" IS NOT NULL AND btrim("phone") <> '')
   OR ("websiteUrl" IS NOT NULL AND btrim("websiteUrl") <> '')
   OR ("whatsapp" IS NOT NULL AND btrim("whatsapp") <> '');

-- CreateIndex
CREATE INDEX "Clinic_isPublished_idx" ON "Clinic"("isPublished");
