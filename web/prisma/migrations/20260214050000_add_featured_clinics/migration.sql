-- AlterTable
ALTER TABLE "Clinic"
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "featuredRank" INTEGER;

-- CreateIndex
CREATE INDEX "Clinic_isFeatured_featuredRank_idx" ON "Clinic"("isFeatured", "featuredRank");
