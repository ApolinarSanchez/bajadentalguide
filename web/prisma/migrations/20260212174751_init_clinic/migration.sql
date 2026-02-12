-- CreateTable
CREATE TABLE "Clinic" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "addressLine1" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Tijuana',
    "state" TEXT NOT NULL DEFAULT 'BC',
    "country" TEXT NOT NULL DEFAULT 'MX',
    "phone" TEXT,
    "whatsapp" TEXT,
    "websiteUrl" TEXT,
    "googleMapsUrl" TEXT,
    "yelpUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_slug_key" ON "Clinic"("slug");

-- CreateIndex
CREATE INDEX "Clinic_slug_idx" ON "Clinic"("slug");
