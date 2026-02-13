-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN "neighborhoodId" UUID;

-- CreateTable
CREATE TABLE "Neighborhood" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Neighborhood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicProcedure" (
    "clinicId" UUID NOT NULL,
    "procedureId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicProcedure_pkey" PRIMARY KEY ("clinicId","procedureId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Neighborhood_slug_key" ON "Neighborhood"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_slug_key" ON "Procedure"("slug");

-- CreateIndex
CREATE INDEX "Clinic_neighborhoodId_idx" ON "Clinic"("neighborhoodId");

-- CreateIndex
CREATE INDEX "ClinicProcedure_clinicId_idx" ON "ClinicProcedure"("clinicId");

-- CreateIndex
CREATE INDEX "ClinicProcedure_procedureId_idx" ON "ClinicProcedure"("procedureId");

-- AddForeignKey
ALTER TABLE "Clinic"
ADD CONSTRAINT "Clinic_neighborhoodId_fkey"
FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicProcedure"
ADD CONSTRAINT "ClinicProcedure_clinicId_fkey"
FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicProcedure"
ADD CONSTRAINT "ClinicProcedure_procedureId_fkey"
FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
