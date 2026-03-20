// prisma.config.ts — Prisma v7 CLI configuration
// - datasource.url: used by Prisma CLI (prisma db push, migrate, etc.)
// - The runtime adapter (PrismaPg) is configured separately in src/lib/db.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
