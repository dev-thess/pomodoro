import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET streaks for the current user
export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.email) {
    return new NextResponse(
      JSON.stringify({ error: "You must be logged in" }),
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const streaks = await prisma.streak.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(streaks);
  } catch (error) {
    console.error("Error fetching streaks:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch streaks" }),
      { status: 500 }
    );
  }
}

// POST to update or create a streak
export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.email) {
    return new NextResponse(
      JSON.stringify({ error: "You must be logged in" }),
      { status: 401 }
    );
  }

  try {
    const { date, sessions } = await req.json();

    if (!date || typeof sessions !== "number") {
      return new NextResponse(
        JSON.stringify({ error: "Date and sessions are required" }),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Try to update existing streak first, if it doesn't exist, create a new one
    const streak = await prisma.streak.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(date),
        },
      },
      update: {
        sessions,
      },
      create: {
        userId: user.id,
        date: new Date(date),
        sessions,
      },
    });

    return NextResponse.json(streak);
  } catch (error) {
    console.error("Error updating streak:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update streak" }),
      { status: 500 }
    );
  }
}
