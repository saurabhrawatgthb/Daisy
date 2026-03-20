// prisma.config.ts — Prisma v7 CLI configuration
// NOTE: The database adapter (PrismaPg) is configured in src/lib/db.ts,
// not here. This file is only used by the Prisma CLI for migrations/schema.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
