import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { battleId, teamId, amount, currency, supporterName, message } = body;

    if (!battleId || !teamId || amount === undefined || !currency) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (currency !== "USD") {
      return NextResponse.json({ error: "Moneda no soportada" }, { status: 400 });
    }

    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    if (amount <= 0 || amount > 1000) {
      return NextResponse.json({ error: "El monto debe ser mayor a 0 y hasta 1000 USD" }, { status: 400 });
    }

    // Clean strings
    const safeSupporterName = supporterName ? String(supporterName).trim().substring(0, 50) : "Hincha Anónimo";
    const safeMessage = message ? String(message).trim().substring(0, 80) : null;

    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle) {
      return NextResponse.json({ error: "La batalla no existe" }, { status: 404 });
    }

    const now = new Date();
    
    if (battle.status !== "active") {
      return NextResponse.json({ error: "La batalla no está activa" }, { status: 403 });
    }

    if (now < battle.startsAt) {
      return NextResponse.json({ error: "La batalla aún no ha comenzado" }, { status: 403 });
    }

    if (battle.endsAt && now >= battle.endsAt) {
      return NextResponse.json({ error: "La batalla ha finalizado por límite de tiempo" }, { status: 403 });
    }

    if (teamId !== battle.teamAId && teamId !== battle.teamBId) {
      return NextResponse.json({ error: "El equipo seleccionado no pertenece a esta batalla" }, { status: 400 });
    }

    // 1. Create support in database as "pending"
    const support = await prisma.support.create({
      data: {
        battleId,
        teamId,
        amount: parseFloat(amount.toString()),
        currency: "USD",
        supporterName: safeSupporterName,
        message: safeMessage,
        paymentStatus: "pending"
      }
    });

    // 2. Prepare architecture for future payment provider (ePayco)
    // Here we will generate the checkout session with ePayco.
    // Since ePayco is not integrated yet, we do NOT simulate it.
    // The status remains 'pending' until the real webhook updates it to 'paid'.
    const checkoutUrl = null; 

    // 3. Return response
    return NextResponse.json({ 
      support, 
      checkout_url: checkoutUrl,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating support:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
