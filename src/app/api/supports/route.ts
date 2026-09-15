import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import DodoPayments from 'dodopayments';

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_SECRET_KEY || "dummy_key",
  environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { battleId, team, amount, supporterName, message } = body;

    if (!battleId || !team || amount === undefined) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (team !== "A" && team !== "B") {
      return NextResponse.json({ error: "Equipo inválido" }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a cero" }, { status: 400 });
    }

    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle) {
      return NextResponse.json({ error: "La batalla no existe" }, { status: 404 });
    }

    // 1. Create support in SQLite as "pending"
    const support = await prisma.support.create({
      data: {
        battleId,
        team,
        amount: parseFloat(amount),
        supporterName: supporterName || "Hincha Anónimo",
        message: message || null,
        paymentStatus: "pending"
      }
    });

    // 2. Generate Dodo Payments Checkout Session
    // We wrap this in a try-catch to ensure we can handle SDK errors gracefully
    let checkoutUrl = "";
    try {
      if (process.env.DODO_PAYMENTS_SECRET_KEY) {
        // Here we pass the dynamic amount. Dodo Payments API might require a product_cart or amount directly.
        // Assuming a generic approach based on standard APIs or product IDs you might configure later.
        const session = await dodoClient.checkoutSessions.create({
          product_cart: [{
            product_id: 'pdt_support', // You will need to create this product in your Dodo Dashboard with 'Pay What You Want' enabled
            quantity: 1,
            amount: Math.round(parseFloat(amount) * 100), // Dodo expects amount in cents
          }],
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/b/${battleId}?success=true`,
          metadata: {
            reference_id: support.id,
            battle_id: battle.id
          }
        });
        checkoutUrl = session.checkout_url || "";
      } else {
        // Fallback for local development if keys are not set yet
        console.warn("DODO_PAYMENTS_SECRET_KEY no está configurada. Usando URL simulada.");
        checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/b/${battleId}?success=true&mock=true`;
      }
    } catch (dodoError) {
      console.error("Error creating Dodo checkout:", dodoError);
      return NextResponse.json({ error: "Error al generar el link de pago" }, { status: 502 });
    }

    // 3. Return the checkout URL
    return NextResponse.json({ 
      support, 
      checkout_url: checkoutUrl 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating support:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
