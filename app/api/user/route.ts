import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

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
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        points: true,
        createdAt: true,
      },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch user data" }),
      { status: 500 }
    );
  }
}
