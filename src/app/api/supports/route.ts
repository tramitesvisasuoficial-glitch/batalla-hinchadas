import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { battleId, team, amount, currency, supporterName, message } = body;

    if (!battleId || !team || amount === undefined || !currency) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (currency !== "USD") {
      return NextResponse.json({ error: "Moneda no soportada" }, { status: 400 });
    }

    if (team !== "A" && team !== "B") {
      return NextResponse.json({ error: "Equipo inválido" }, { status: 400 });
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

    // 1. Create support in database as "pending"
    const support = await prisma.support.create({
      data: {
        battleId,
        team,
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
