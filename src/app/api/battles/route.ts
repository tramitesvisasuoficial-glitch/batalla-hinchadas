import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, teamAName, teamAColor, teamBName, teamBColor, endsAt } = body;

    // Validation
    if (!title || !teamAName || !teamAColor || !teamBName || !teamBColor) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create in SQLite
    const battle = await prisma.battle.create({
      data: {
        title,
        teamAName,
        teamAColor,
        teamBName,
        teamBColor,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });

    return NextResponse.json(battle, { status: 201 });
  } catch (error) {
    console.error("Error creating battle:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const battles = await prisma.battle.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(battles, { status: 200 });
  } catch (error) {
    console.error("Error fetching battles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
