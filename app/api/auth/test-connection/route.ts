import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint is for diagnosing database connection issues in production
// It should be removed or secured in a real production environment
export async function GET() {
  try {
    // Try to fetch a simple query to test database connectivity
    const startTime = Date.now();
    const result = await prisma.user.count();
    const endTime = Date.now();

    // Report success with timing information
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount: result,
      responseTimeMs: endTime - startTime,
      databaseInfo: {
        provider: "postgresql",
        connectionMethod: "Prisma with Supabase pooler",
        hasSSL: process.env.DATABASE_URL?.includes("sslmode=require") ?? false,
      },
    });
  } catch (error: any) {
    // Detailed error reporting (safe for production, doesn't expose credentials)
    console.error("Database connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error.message,
        code: error.code,
        meta: error.meta,
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasSslMode:
            process.env.DATABASE_URL?.includes("sslmode=require") ?? false,
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    );
  }
}
