import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, teamAId, teamBId, endsAt } = body;

    // Validation
    if (!title || !teamAId || !teamBId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (teamAId === teamBId) {
      return NextResponse.json({ error: "El Equipo A y el Equipo B no pueden ser el mismo" }, { status: 400 });
    }

    // Create in Database
    const battle = await prisma.battle.create({
      data: {
        title,
        teamAId,
        teamBId,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
      include: {
        teamA: true,
        teamB: true,
      }
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
      include: {
        teamA: true,
        teamB: true,
        _count: {
          select: { supports: true }
        }
      }
    });
    return NextResponse.json(battles, { status: 200 });
  } catch (error) {
    console.error("Error fetching battles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
