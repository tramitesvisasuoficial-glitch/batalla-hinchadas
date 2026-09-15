import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color, logo } = body;

    if (!name) {
      return NextResponse.json({ error: "El nombre del equipo es obligatorio" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        color,
        logo,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    console.error("Error creating team:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Ya existe un equipo con ese nombre" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
