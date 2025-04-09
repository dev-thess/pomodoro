import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET notes for the current user, optionally filtered by date
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

    // Check if we have a date filter
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    let notesQuery = {
      where: {
        userId: user.id,
        ...(date ? { date: new Date(date) } : {}),
      },
      orderBy: [{ date: "desc" as const }, { session: "asc" as const }],
    };

    const notes = await prisma.note.findMany(notesQuery);

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch notes" }),
      { status: 500 }
    );
  }
}

// POST to create or update a note
export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.email) {
    return new NextResponse(
      JSON.stringify({ error: "You must be logged in" }),
      { status: 401 }
    );
  }

  try {
    const { date, session, content } = await req.json();

    if (!date || typeof session !== "number" || typeof content !== "string") {
      return new NextResponse(
        JSON.stringify({ error: "Date, session, and content are required" }),
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

    // Try to update existing note first, if it doesn't exist, create a new one
    const note = await prisma.note.upsert({
      where: {
        userId_date_session: {
          userId: user.id,
          date: new Date(date),
          session,
        },
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        date: new Date(date),
        session,
        content,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error saving note:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to save note" }), {
      status: 500,
    });
  }
}
