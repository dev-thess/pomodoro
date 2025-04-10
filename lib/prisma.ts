import { PrismaClient } from "@prisma/client";

// Define global type to hold PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Connection pooling configuration - optimized for Vercel serverless functions
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: "minimal",
    // Connection pooling settings for Supabase PostgreSQL
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// PrismaClient is attached to the `globalThis` object in development to prevent
// exhausting your database connection limit from instantiating too many instances
// See https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
export const prisma = globalThis.prisma ?? prismaClientSingleton();

// Only cache client in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
} else {
  // In production, perform a quick test connection but don't store the client globally
  prisma
    .$connect()
    .then(() => {
      console.log("✅ Connected to Supabase PostgreSQL via pooler");

      // Verify correct connection URL
      const hasPooler = process.env.DATABASE_URL?.includes(
        "pooler.supabase.com"
      );

      if (!hasPooler) {
        console.warn(
          "⚠️ Warning: DATABASE_URL should use Supabase pooler for best performance"
        );
      }
    })
    .catch((err) => {
      console.error("❌ Database connection error:", err.message);

      // Log connection details without credentials
      if (process.env.DATABASE_URL) {
        const redactedUrl = process.env.DATABASE_URL.replace(
          /postgresql:\/\/([^:]+):([^@]+)@/,
          "postgresql://$1:***@"
        );
        console.error(`DB URL format: ${redactedUrl}`);
      }
    });
}

export default prisma;
