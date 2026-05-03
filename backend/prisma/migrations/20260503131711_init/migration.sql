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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distro_releases" (
    "id" UUID NOT NULL,
    "distro_id" UUID NOT NULL,
    "version" TEXT,
    "codename" TEXT,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distro_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" UUID NOT NULL,
    "distro_id" UUID NOT NULL,
    "release_id" UUID,
    "name" TEXT NOT NULL,
    "base_url" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repository_gpg_keys" (
    "id" UUID NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "key_id" TEXT NOT NULL,
    "armored_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repository_gpg_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" UUID NOT NULL,
    "distro_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_versions" (
    "id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "repository_id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "architecture" TEXT NOT NULL,
    "file_name" TEXT,
    "size_bytes" BIGINT,
    "checksum" TEXT,
    "checksum_type" TEXT DEFAULT 'sha256',
    "depends" TEXT,
    "section" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "hostname" TEXT NOT NULL,
    "release_id" UUID,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "workspace_id" UUID NOT NULL,
    "agent_token_hash" TEXT NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_packages" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "installed_version" TEXT NOT NULL,
    "package_version_id" UUID,
    "source_repo_id" UUID,
    "installed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
CREATE UNIQUE INDEX "distro_releases_distro_id_slug_key" ON "distro_releases"("distro_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "repository_gpg_keys_fingerprint_key" ON "repository_gpg_keys"("fingerprint");

-- CreateIndex
CREATE INDEX "packages_name_idx" ON "packages"("name");

-- CreateIndex
CREATE INDEX "packages_created_at_idx" ON "packages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "packages_distro_id_name_key" ON "packages"("distro_id", "name");

-- CreateIndex
CREATE INDEX "package_versions_created_at_idx" ON "package_versions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "package_versions_package_id_repository_id_version_architect_key" ON "package_versions"("package_id", "repository_id", "version", "architecture");

-- CreateIndex
CREATE INDEX "devices_hostname_idx" ON "devices"("hostname");

-- CreateIndex
CREATE INDEX "devices_created_at_idx" ON "devices"("created_at");

-- CreateIndex
CREATE INDEX "devices_updated_at_idx" ON "devices"("updated_at");

-- CreateIndex
CREATE INDEX "device_packages_created_at_idx" ON "device_packages"("created_at");

-- CreateIndex
CREATE INDEX "device_packages_updated_at_idx" ON "device_packages"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "device_packages_device_id_package_id_key" ON "device_packages"("device_id", "package_id");

-- CreateIndex
CREATE INDEX "_RepositoryToRepositoryGpgKey_B_index" ON "_RepositoryToRepositoryGpgKey"("B");

-- AddForeignKey
ALTER TABLE "workspace_tokens" ADD CONSTRAINT "workspace_tokens_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distro_releases" ADD CONSTRAINT "distro_releases_distro_id_fkey" FOREIGN KEY ("distro_id") REFERENCES "distros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_distro_id_fkey" FOREIGN KEY ("distro_id") REFERENCES "distros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "distro_releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_distro_id_fkey" FOREIGN KEY ("distro_id") REFERENCES "distros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_versions" ADD CONSTRAINT "package_versions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_versions" ADD CONSTRAINT "package_versions_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repositories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "distro_releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_packages" ADD CONSTRAINT "device_packages_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_packages" ADD CONSTRAINT "device_packages_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_packages" ADD CONSTRAINT "device_packages_package_version_id_fkey" FOREIGN KEY ("package_version_id") REFERENCES "package_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_packages" ADD CONSTRAINT "device_packages_source_repo_id_fkey" FOREIGN KEY ("source_repo_id") REFERENCES "repositories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RepositoryToRepositoryGpgKey" ADD CONSTRAINT "_RepositoryToRepositoryGpgKey_A_fkey" FOREIGN KEY ("A") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RepositoryToRepositoryGpgKey" ADD CONSTRAINT "_RepositoryToRepositoryGpgKey_B_fkey" FOREIGN KEY ("B") REFERENCES "repository_gpg_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
