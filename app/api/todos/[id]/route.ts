import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PATCH: Update a todo (toggle completion)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  // Check if user is authenticated
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todoId = params.id;
    const data = await request.json();

    // Validate input - checking if completed is a boolean
    if (typeof data.completed !== "boolean") {
      return NextResponse.json(
        { error: "Completed state must be a boolean" },
        { status: 400 }
      );
    }

    // Ensure the todo belongs to the user
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
      select: { userId: true },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (existingTodo.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own todos" },
        { status: 403 }
      );
    }

    // Update the todo
    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: { completed: data.completed },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  // Check if user is authenticated
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todoId = params.id;

    // Ensure the todo belongs to the user
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
      select: { userId: true },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (existingTodo.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own todos" },
        { status: 403 }
      );
    }

    // Delete the todo
    await prisma.todo.delete({
      where: { id: todoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
