import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../src/generated/prisma/client"
import { seedUbuntuReleases, seedDistros, seedDebianReleases } from "./distros"
import { seedUbuntuRepositories } from "./packages"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await seedDistros(prisma)
  await seedUbuntuReleases(prisma)
  await seedDebianReleases(prisma)
  await seedUbuntuRepositories(prisma)
}

await prisma.$connect()
try {
  await main()
} catch (e) {
  console.error("Error seeding database:", e)
} finally {
  await prisma.$disconnect()
  await pool.end()
}
