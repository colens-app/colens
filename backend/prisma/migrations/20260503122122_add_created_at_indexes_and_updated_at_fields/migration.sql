/*
  Warnings:

  - Added the required column `updatedAt` to the `device_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `devices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "device_packages" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "device_packages_createdAt_idx" ON "device_packages"("createdAt");

-- CreateIndex
CREATE INDEX "device_packages_updatedAt_idx" ON "device_packages"("updatedAt");

-- CreateIndex
CREATE INDEX "devices_hostname_idx" ON "devices"("hostname");

-- CreateIndex
CREATE INDEX "devices_createdAt_idx" ON "devices"("createdAt");

-- CreateIndex
CREATE INDEX "devices_updatedAt_idx" ON "devices"("updatedAt");

-- CreateIndex
CREATE INDEX "package_versions_createdAt_idx" ON "package_versions"("createdAt");

-- CreateIndex
CREATE INDEX "packages_createdAt_idx" ON "packages"("createdAt");
