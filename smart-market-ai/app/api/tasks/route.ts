import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

const task = await prisma.task.create({
  data: {
    title: body.title,
    description: body.description || "",
    project: body.project || "",
    type: body.type || "task",
    priority: body.priority || "medium",
    status: "planned",
    date: new Date(body.date),
    startTime: body.startTime || "",
    endTime: body.endTime || "",
    repeat: body.repeat || "Нет",
    executor: body.executor || "",
    reminder: body.reminder || "",
    done: false,
  },
});

    return NextResponse.json(task);
  } catch (error) {
    console.error("POST TASK ERROR:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}