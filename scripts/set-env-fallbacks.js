#!/usr/bin/env node

/**
 * This script sets fallback environment variables if they're not defined
 * Specifically handles DIRECT_DATABASE_URL for Prisma
 */

// Check if DIRECT_DATABASE_URL is missing and set a fallback based on DATABASE_URL
if (!process.env.DIRECT_DATABASE_URL && process.env.DATABASE_URL) {
  console.log(
    "❗ DIRECT_DATABASE_URL not found. Setting temporary fallback for Prisma to work properly."
  );

  // Use the same URL as DATABASE_URL for compatibility
  process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL;

  console.log(
    "✅ Temporary environment variable set. Continuing with build..."
  );
}

// Exit successfully
process.exit(0);
