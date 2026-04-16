import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Fail fast with a clear message instead of a cryptic connection error.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "FATAL: DATABASE_URL environment variable is not set. " +
      "Add it to your Vercel project settings (Settings → Environment Variables).",
  );
}

const connectionString = process.env.DATABASE_URL;

// For local databases (localhost / 127.0.0.1) SSL is usually not configured,
// so we leave it off.  For every other host (Supabase, Neon, Railway, etc.)
// we enable SSL but skip certificate-authority verification so the adapter
// works with any cloud provider out of the box.  This also suppresses the
// pg-connection-string deprecation warning that fires when the connection
// string contains sslmode=require / sslmode=prefer / sslmode=verify-ca,
// because we control SSL through the Pool options instead of the URL.
const isLocalDatabase =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

const sslConfig: pg.PoolConfig["ssl"] = isLocalDatabase
  ? false
  : { rejectUnauthorized: false };

const pool = new pg.Pool({
  connectionString,
  ssl: sslConfig,
});

// Log pool-level errors so they appear in Vercel function logs rather than
// crashing the process silently.
pool.on("error", (err) => {
  console.error("[prisma] pg pool error:", err);
});

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

// In development, reuse the client across hot-reloads to avoid exhausting
// the connection pool.  In production every function invocation gets a fresh
// module evaluation, so there is nothing to cache.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
