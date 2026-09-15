import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, teamAId, teamBId, startsAt, endsAt, status } = body;

    const battle = await prisma.battle.findUnique({
      where: { id },
      include: {
        _count: {
          select: { supports: true }
        }
      }
    });

    if (!battle) {
      return NextResponse.json({ error: "Batalla no encontrada" }, { status: 404 });
    }

    const updates: any = {};
    if (title) updates.title = title;
    
    if (startsAt !== undefined) {
      updates.startsAt = startsAt ? new Date(startsAt) : new Date();
    }
    if (endsAt !== undefined) {
      updates.endsAt = endsAt ? new Date(endsAt) : null;
    }
    if (status) updates.status = status;
    
    const newStartsAt = updates.startsAt || battle.startsAt;
    const newEndsAt = updates.endsAt !== undefined ? updates.endsAt : battle.endsAt;

    if (newEndsAt && newEndsAt <= newStartsAt) {
      return NextResponse.json({ error: "La fecha de finalización debe ser mayor a la fecha de inicio" }, { status: 400 });
    }

    // Check if team changes are requested
    const teamsChanged = (teamAId && teamAId !== battle.teamAId) || (teamBId && teamBId !== battle.teamBId);

    if (teamsChanged) {
      // Validate no supports exist
      if (battle._count.supports > 0) {
        return NextResponse.json({ 
          error: "No se pueden modificar los equipos de una batalla que ya tiene participaciones registradas." 
        }, { status: 403 });
      }

      if (teamAId === teamBId) {
        return NextResponse.json({ error: "El Equipo A y el Equipo B no pueden ser el mismo" }, { status: 400 });
      }

      if (teamAId) updates.teamAId = teamAId;
      if (teamBId) updates.teamBId = teamBId;
    }

    const updatedBattle = await prisma.battle.update({
      where: { id },
      data: updates,
      include: {
        teamA: true,
        teamB: true,
      }
    });

    return NextResponse.json(updatedBattle, { status: 200 });

  } catch (error) {
    console.error("Error updating battle:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
