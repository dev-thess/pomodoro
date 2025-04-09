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
    const { notes } = await req.json();

    if (!Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json({ success: true, message: "No notes to sync" });
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Process each note
    const results = await Promise.all(
      notes.map(async (note) => {
        // Check if this note already exists
        const existingNote = await prisma.note.findUnique({
          where: {
            userId_date_session: {
              userId: user.id,
              date: new Date(note.date),
              session: note.session,
            },
          },
        });

        if (!existingNote) {
          // Create new note if it doesn't exist
          return prisma.note.create({
            data: {
              content: note.content,
              date: new Date(note.date),
              session: note.session,
              userId: user.id,
            },
          });
        }
        return existingNote;
      })
    );

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${results.length} notes`,
    });
  } catch (error) {
    console.error("Error syncing notes:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to sync notes" }), {
      status: 500,
    });
  }
}
