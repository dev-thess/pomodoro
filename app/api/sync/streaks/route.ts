import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.email) {
    return new NextResponse(
      JSON.stringify({ error: "You must be logged in" }),
      { status: 401 }
    );
  }

  try {
    const { streaks } = await req.json();

    if (!Array.isArray(streaks) || streaks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No streaks to sync",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Process each streak
    const results = await Promise.all(
      streaks.map(async (streak) => {
        // Try to update existing streak first, create it if it doesn't exist
        const result = await prisma.streak.upsert({
          where: {
            userId_date: {
              userId: user.id,
              date: new Date(streak.date),
            },
          },
          update: {
            // Only update if the new count is higher than what's in the database
            sessions: {
              increment: 0, // This will be overridden by the below if needed
            },
          },
          create: {
            date: new Date(streak.date),
            sessions: streak.sessions,
            userId: user.id,
          },
        });

        // If the streak already existed, check if we need to update the sessions count
        if (result.sessions < streak.sessions) {
          return prisma.streak.update({
            where: { id: result.id },
            data: { sessions: streak.sessions },
          });
        }

        return result;
      })
    );

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${results.length} streaks`,
    });
  } catch (error) {
    console.error("Error syncing streaks:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to sync streaks" }),
      { status: 500 }
    );
  }
}
