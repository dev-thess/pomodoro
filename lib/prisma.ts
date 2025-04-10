import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Production-optimized Prisma client configuration
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
    errorFormat: "minimal",
  });

// Only cache the client instance in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // In production, perform a quick test connection to verify database connectivity
  prisma
    .$connect()
    .then(() => {
      console.log("✅ Successfully connected to Supabase PostgreSQL database");
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
