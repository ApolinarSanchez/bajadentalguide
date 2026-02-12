-- CreateTable
CREATE TABLE "SavedClinic" (
    "id" UUID NOT NULL,
    "sessionId" TEXT NOT NULL,
    "clinicId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedClinic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedClinic_sessionId_idx" ON "SavedClinic"("sessionId");

-- CreateIndex
CREATE INDEX "SavedClinic_clinicId_idx" ON "SavedClinic"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedClinic_sessionId_clinicId_key" ON "SavedClinic"("sessionId", "clinicId");

-- AddForeignKey
ALTER TABLE "SavedClinic" ADD CONSTRAINT "SavedClinic_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
