import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  schemaSynced?: boolean;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/daisy";
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Automatically ensures new columns and tables exist in PostgreSQL without breaking existing tables
 */
export async function ensureDatabaseSchema() {
  if (globalForPrisma.schemaSynced) return;
  try {
    await prisma.$executeRawUnsafe(`
      -- User table columns
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'customer';

      -- Product table columns
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "inStock" BOOLEAN DEFAULT true;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "stockQuantity" INTEGER DEFAULT 100;

      -- Order table columns
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "userId" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'UPI';
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 0;

      -- OrderItem table columns
      ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "productTitle" TEXT;

      -- Address Table
      CREATE TABLE IF NOT EXISTS "Address" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "label" TEXT NOT NULL DEFAULT 'Home',
        "name" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "pincode" TEXT NOT NULL,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- Review Table
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "userId" TEXT,
        "userName" TEXT NOT NULL,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "comment" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    globalForPrisma.schemaSynced = true;
  } catch (e) {
    console.warn('[DB Schema Sync]:', e instanceof Error ? e.message : e);
  }
}

