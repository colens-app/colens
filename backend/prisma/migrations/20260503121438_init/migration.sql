-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_tokens" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "workspace_id" UUID NOT NULL,

    CONSTRAINT "workspace_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distros" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distro_releases" (
    "id" UUID NOT NULL,
    "distroId" UUID NOT NULL,
    "version" TEXT,
    "codename" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distro_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" UUID NOT NULL,
    "distroId" UUID NOT NULL,
    "releaseId" UUID,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repository_gpg_keys" (
    "id" UUID NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "armoredKey" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repository_gpg_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" UUID NOT NULL,
    "distroId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_versions" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "architecture" TEXT NOT NULL,
    "filename" TEXT,
    "sizeBytes" BIGINT,
    "checksum" TEXT,
    "checksumType" TEXT DEFAULT 'sha256',
    "depends" TEXT,
    "section" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "hostname" TEXT NOT NULL,
    "releaseId" UUID,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspace_id" UUID NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_packages" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "installedVersion" TEXT NOT NULL,
    "packageVersionId" UUID,
    "sourceRepoId" UUID,
    "installedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RepositoryToRepositoryGpgKey" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RepositoryToRepositoryGpgKey_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "distros_name_family_key" ON "distros"("name", "family");

-- CreateIndex
CREATE UNIQUE INDEX "distro_releases_distroId_slug_key" ON "distro_releases"("distroId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "repository_gpg_keys_fingerprint_key" ON "repository_gpg_keys"("fingerprint");

-- CreateIndex
CREATE INDEX "packages_name_idx" ON "packages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "packages_distroId_name_key" ON "packages"("distroId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "package_versions_packageId_repositoryId_version_architectur_key" ON "package_versions"("packageId", "repositoryId", "version", "architecture");

-- CreateIndex
CREATE UNIQUE INDEX "device_packages_deviceId_packageId_key" ON "device_packages"("deviceId", "packageId");

-- CreateIndex
CREATE INDEX "_RepositoryToRepositoryGpgKey_B_index" ON "_RepositoryToRepositoryGpgKey"("B");

-- AddForeignKey
ALTER TABLE "workspace_tokens" ADD CONSTRAINT "workspace_tokens_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distro_releases" ADD CONSTRAINT "distro_releases_distroId_fkey" FOREIGN KEY ("distroId") REFERENCES "distros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_distroId_fkey" FOREIGN KEY ("distroId") REFERENCES "distros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "distro_releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_distroId_fkey" FOREIGN KEY ("distroId") REFERENCES "distros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_versions" ADD CONSTRAINT "package_versions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_versions" ADD CONSTRAINT "package_versions_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "distro_releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_packages" ADD CONSTRAINT "device_packages_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_packages" ADD CONSTRAINT "device_packages_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_packages" ADD CONSTRAINT "device_packages_packageVersionId_fkey" FOREIGN KEY ("packageVersionId") REFERENCES "package_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_packages" ADD CONSTRAINT "device_packages_sourceRepoId_fkey" FOREIGN KEY ("sourceRepoId") REFERENCES "repositories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RepositoryToRepositoryGpgKey" ADD CONSTRAINT "_RepositoryToRepositoryGpgKey_A_fkey" FOREIGN KEY ("A") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RepositoryToRepositoryGpgKey" ADD CONSTRAINT "_RepositoryToRepositoryGpgKey_B_fkey" FOREIGN KEY ("B") REFERENCES "repository_gpg_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
