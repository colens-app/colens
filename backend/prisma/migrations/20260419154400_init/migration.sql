-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,

    CONSTRAINT "workspace_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taken_hash" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "arch" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,

    CONSTRAINT "agent_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_sources" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "cert" TEXT,
    "agent_id" TEXT NOT NULL,

    CONSTRAINT "agent_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_packages_name_arch_agent_id_key" ON "agent_packages"("name", "arch", "agent_id");

-- AddForeignKey
ALTER TABLE "workspace_tokens" ADD CONSTRAINT "workspace_tokens_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_packages" ADD CONSTRAINT "agent_packages_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_sources" ADD CONSTRAINT "agent_sources_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
