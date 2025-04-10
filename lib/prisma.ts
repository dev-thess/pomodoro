import { PrismaClient } from "@prisma/client";

// Define global type to hold PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Connection pooling configuration - improved for Vercel serverless functions
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
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

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
} else {
  // In production, perform a quick test connection to verify database connectivity
  prisma
    .$connect()
    .then(() => {
      console.log("✅ Successfully connected to Supabase PostgreSQL database");

      // Verify that both database URLs are configured properly
      const hasPooler = process.env.DATABASE_URL?.includes(
        "pooler.supabase.com"
      );
      const hasDirectUrl = !!process.env.DIRECT_DATABASE_URL;

      if (!hasPooler) {
        console.warn(
          "⚠️ DATABASE_URL is not using the Supabase connection pooler. This could lead to connection issues in serverless environments."
        );
      }

      if (!hasDirectUrl) {
        console.warn(
          "⚠️ DIRECT_DATABASE_URL is not set. This may cause issues with migrations and introspection."
        );
      }
    })
    .catch((err) => {
      console.error("❌ Database connection error:", err.message);
      // Log more details about the connection string (without exposing credentials)
      if (process.env.DATABASE_URL) {
        const redactedUrl = process.env.DATABASE_URL.replace(
          /postgresql:\/\/([^:]+):([^@]+)@/,
          "postgresql://$1:***@"
        );
        console.error(`Database URL format: ${redactedUrl}`);
      } else {
        console.error("DATABASE_URL environment variable is missing");
      }
    });
}

export default prisma;
