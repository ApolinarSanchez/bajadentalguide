-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "sessionId" TEXT,
    "clinicId" UUID,
    "eventName" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_sessionId_idx" ON "Event"("sessionId");

-- CreateIndex
CREATE INDEX "Event_clinicId_idx" ON "Event"("clinicId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
