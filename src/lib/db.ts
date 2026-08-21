import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  schemaSynced?: boolean;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Automatically ensures new columns exist in PostgreSQL without breaking existing tables
 */
export async function ensureDatabaseSchema() {
  if (globalForPrisma.schemaSynced) return;
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'customer';
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "userId" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'UPI';
    `);
    globalForPrisma.schemaSynced = true;
  } catch (e) {
    // If raw query fails or already exists, log once and continue
    console.warn('[DB Schema Sync]:', e instanceof Error ? e.message : e);
  }
}

