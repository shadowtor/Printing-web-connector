-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "connector";

-- CreateEnum
CREATE TYPE "connector"."PrinterState" AS ENUM ('idle', 'queued', 'printing', 'paused', 'error', 'completed', 'offline');

-- CreateEnum
CREATE TYPE "connector"."AttemptStatus" AS ENUM ('queued', 'starting', 'printing', 'completed', 'failed', 'cancelled', 'interrupted');

-- CreateTable
CREATE TABLE "connector"."Printer" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "amsPresent" BOOLEAN NOT NULL DEFAULT false,
    "nozzleConfig" TEXT,
    "firmwareVersion" TEXT,
    "normalizedState" "connector"."PrinterState" NOT NULL DEFAULT 'idle',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector"."PrinterStatusHistory" (
    "id" TEXT NOT NULL,
    "printerId" TEXT NOT NULL,
    "state" "connector"."PrinterState" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrinterStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector"."OrderItemLink" (
    "id" TEXT NOT NULL,
    "printingWebOrderId" TEXT NOT NULL,
    "printingWebOrderItemId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector"."PrintAttempt" (
    "id" TEXT NOT NULL,
    "orderItemLinkId" TEXT NOT NULL,
    "printerId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" "connector"."AttemptStatus" NOT NULL DEFAULT 'queued',
    "reason" TEXT,
    "notes" TEXT,
    "materialUsageG" DOUBLE PRECISION,
    "powerUsageKwh" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector"."FilamentStock" (
    "id" TEXT NOT NULL,
    "printerId" TEXT,
    "materialType" TEXT NOT NULL,
    "color" TEXT,
    "amsSlot" INTEGER,
    "estimatedRemaining" DOUBLE PRECISION NOT NULL,
    "lowStockThreshold" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilamentStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector"."StockEvent" (
    "id" TEXT NOT NULL,
    "filamentStockId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "delta" DOUBLE PRECISION,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector"."RestockRecommendation" (
    "id" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "recommendedGrams" DOUBLE PRECISION NOT NULL,
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestockRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector"."TimelapseAsset" (
    "id" TEXT NOT NULL,
    "printAttemptId" TEXT NOT NULL,
    "sourcePath" TEXT,
    "youtubeVideoId" TEXT,
    "youtubeUrl" TEXT,
    "internalVisible" BOOLEAN NOT NULL DEFAULT true,
    "customerVisible" BOOLEAN NOT NULL DEFAULT false,
    "uploadStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelapseAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector"."AuditEvent" (
    "id" TEXT NOT NULL,
    "printAttemptId" TEXT,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "eventType" TEXT NOT NULL,
    "payloadSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector"."SyncEvent" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Printer_externalId_key" ON "connector"."Printer"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Printer_serial_key" ON "connector"."Printer"("serial");

-- CreateIndex
CREATE INDEX "PrinterStatusHistory_printerId_createdAt_idx" ON "connector"."PrinterStatusHistory"("printerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItemLink_printingWebOrderItemId_key" ON "connector"."OrderItemLink"("printingWebOrderItemId");

-- CreateIndex
CREATE INDEX "PrintAttempt_printerId_status_idx" ON "connector"."PrintAttempt"("printerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PrintAttempt_orderItemLinkId_attemptNumber_key" ON "connector"."PrintAttempt"("orderItemLinkId", "attemptNumber");

-- CreateIndex
CREATE INDEX "FilamentStock_printerId_materialType_idx" ON "connector"."FilamentStock"("printerId", "materialType");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_createdAt_idx" ON "connector"."AuditEvent"("eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "connector"."PrinterStatusHistory" ADD CONSTRAINT "PrinterStatusHistory_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "connector"."Printer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector"."PrintAttempt" ADD CONSTRAINT "PrintAttempt_orderItemLinkId_fkey" FOREIGN KEY ("orderItemLinkId") REFERENCES "connector"."OrderItemLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector"."PrintAttempt" ADD CONSTRAINT "PrintAttempt_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "connector"."Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector"."FilamentStock" ADD CONSTRAINT "FilamentStock_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "connector"."Printer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector"."StockEvent" ADD CONSTRAINT "StockEvent_filamentStockId_fkey" FOREIGN KEY ("filamentStockId") REFERENCES "connector"."FilamentStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector"."TimelapseAsset" ADD CONSTRAINT "TimelapseAsset_printAttemptId_fkey" FOREIGN KEY ("printAttemptId") REFERENCES "connector"."PrintAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector"."AuditEvent" ADD CONSTRAINT "AuditEvent_printAttemptId_fkey" FOREIGN KEY ("printAttemptId") REFERENCES "connector"."PrintAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
