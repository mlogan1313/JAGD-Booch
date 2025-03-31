-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'BREWER', 'VIEWER');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('F1', 'F2', 'KEGGED', 'BOTTLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BatchType" AS ENUM ('F1', 'F2', 'KEG', 'BOTTLE');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('KETTLE', 'FERMENTER', 'KEG', 'BOTTLE', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DIRTY');

-- CreateEnum
CREATE TYPE "ContainerType" AS ENUM ('BOTTLE', 'KEG', 'OTHER');

-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('EMPTY', 'FILLED', 'DIRTY');

-- CreateEnum
CREATE TYPE "QualityNoteSeverity" AS ENUM ('INFO', 'WARNING', 'ISSUE');

-- CreateEnum
CREATE TYPE "QualityCheckType" AS ENUM ('PH', 'TEMPERATURE', 'TASTE', 'VISUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "QualityCheckStatus" AS ENUM ('PASS', 'FAIL', 'WARNING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BREWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "batchNumber" INTEGER NOT NULL,
    "batchDate" TIMESTAMP(3) NOT NULL,
    "batchType" "BatchType" NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "teaType" TEXT NOT NULL,
    "sugarAmount" DOUBLE PRECISION NOT NULL,
    "starterAmount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "lastModifiedById" TEXT NOT NULL,
    "parentBatchId" TEXT,
    "currentStage" "Stage" NOT NULL,
    "stageHistoryJson" TEXT NOT NULL,
    "currentEquipmentId" TEXT,
    "equipmentHistoryJson" TEXT NOT NULL,
    "measurementsJson" TEXT NOT NULL,
    "checklistsJson" TEXT,
    "flavoringJson" TEXT,
    "finishingJson" TEXT,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EquipmentType" NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "currentStatus" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "statusLastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentBatchId" TEXT,
    "maintenanceJson" TEXT,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Container" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ContainerType" NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "currentStatus" "ContainerStatus" NOT NULL DEFAULT 'EMPTY',
    "statusLastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fillDate" TIMESTAMP(3),
    "emptyDate" TIMESTAMP(3),
    "currentBatchId" TEXT,

    CONSTRAINT "Container_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityNote" (
    "id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "severity" "QualityNoteSeverity" NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "batchId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "QualityNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityCheck" (
    "id" TEXT NOT NULL,
    "type" "QualityCheckType" NOT NULL,
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "status" "QualityCheckStatus" NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "batchId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "QualityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Batch_createdById_idx" ON "Batch"("createdById");

-- CreateIndex
CREATE INDEX "Batch_lastModifiedById_idx" ON "Batch"("lastModifiedById");

-- CreateIndex
CREATE INDEX "Batch_parentBatchId_idx" ON "Batch"("parentBatchId");

-- CreateIndex
CREATE INDEX "Batch_currentEquipmentId_idx" ON "Batch"("currentEquipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_currentBatchId_key" ON "Equipment"("currentBatchId");

-- CreateIndex
CREATE INDEX "Equipment_createdById_idx" ON "Equipment"("createdById");

-- CreateIndex
CREATE INDEX "Container_createdById_idx" ON "Container"("createdById");

-- CreateIndex
CREATE INDEX "Container_currentBatchId_idx" ON "Container"("currentBatchId");

-- CreateIndex
CREATE INDEX "QualityNote_batchId_idx" ON "QualityNote"("batchId");

-- CreateIndex
CREATE INDEX "QualityNote_createdById_idx" ON "QualityNote"("createdById");

-- CreateIndex
CREATE INDEX "QualityNote_updatedById_idx" ON "QualityNote"("updatedById");

-- CreateIndex
CREATE INDEX "QualityCheck_batchId_idx" ON "QualityCheck"("batchId");

-- CreateIndex
CREATE INDEX "QualityCheck_createdById_idx" ON "QualityCheck"("createdById");

-- CreateIndex
CREATE INDEX "QualityCheck_updatedById_idx" ON "QualityCheck"("updatedById");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_parentBatchId_fkey" FOREIGN KEY ("parentBatchId") REFERENCES "Batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_currentBatchId_fkey" FOREIGN KEY ("currentBatchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityNote" ADD CONSTRAINT "QualityNote_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityNote" ADD CONSTRAINT "QualityNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityNote" ADD CONSTRAINT "QualityNote_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityCheck" ADD CONSTRAINT "QualityCheck_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityCheck" ADD CONSTRAINT "QualityCheck_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
