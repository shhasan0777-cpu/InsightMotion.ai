import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data: any = {};

    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.startTime !== undefined) data.startTime = body.startTime;
    if (body.endTime !== undefined) data.endTime = body.endTime;
    if (body.title !== undefined) data.title = body.title;
    if (body.repeat !== undefined) data.repeat = body.repeat;
    if (body.executor !== undefined) data.executor = body.executor;
    if (body.reminder !== undefined) data.reminder = body.reminder;
    if (body.description !== undefined) data.description = body.description;
    if (body.project !== undefined) data.project = body.project;
    if (body.type !== undefined) data.type = body.type;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.status !== undefined) data.status = body.status;
    if (body.done !== undefined) data.done = body.done;

    const task = await prisma.task.update({
      where: { id },
      data,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH TASK ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}