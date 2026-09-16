import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supportId = resolvedParams.id;

    if (!supportId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const support = await prisma.support.findUnique({
      where: { id: supportId },
      include: { team: true, battle: true }
    });

    if (!support) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If paid, calculate position and badge
    let position = null;
    let badge = null;
    let badgeEmoji = null;

    if (support.paymentStatus === "paid") {
      const allTeamPaidSupports = await prisma.support.findMany({
        where: {
          battleId: support.battleId,
          teamId: support.teamId,
          paymentStatus: "paid"
        },
        orderBy: [
          { amount: "desc" },
          { createdAt: "asc" }
        ]
      });

      const idx = allTeamPaidSupports.findIndex(s => s.id === support.id);
      position = idx + 1;

      // Find first support across battle
      const firstSupport = await prisma.support.findFirst({
        where: {
          battleId: support.battleId,
          paymentStatus: "paid"
        },
        orderBy: { createdAt: "asc" }
      });

      badge = "Hincha Activo";
      badgeEmoji = "🔥";

      if (firstSupport?.id === support.id) {
        badge = "Primer Hincha";
        badgeEmoji = "🏅";
      } else if (position === 1) {
        badge = "Leyenda";
        badgeEmoji = "👑";
      } else if (position <= 3) {
        badge = "Hincha Destacado";
        badgeEmoji = "⭐";
      }
    }

    return NextResponse.json({
      id: support.id,
      paymentStatus: support.paymentStatus,
      amount: support.amount,
      teamName: support.team?.name,
      teamColor: support.team?.color,
      supporterName: support.supporterName,
      position,
      badge,
      badgeEmoji
    });
  } catch (error) {
    console.error("Support poll error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
