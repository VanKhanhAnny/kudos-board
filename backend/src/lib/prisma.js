import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/*
 * Prisma 7 requires a driver adapter at runtime — you can no longer call
 * `new PrismaClient()` on its own, and the constructor no longer accepts
 * `datasourceUrl` / `datasources` options. The CLI reads `prisma.config.ts`
 * for migrations, but the runtime client is decoupled from that file, so we
 * wire it up here with @prisma/adapter-pg.
 *
 * index.js loads dotenv before importing this module, so DATABASE_URL is
 * populated by the time this constructor runs.
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
