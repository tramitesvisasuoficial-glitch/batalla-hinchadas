import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { battleId, teamId, amount, supporterName, message } = body;

    if (!battleId || !teamId || !amount || !supporterName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // 1. Create a pending Support in DB
    const support = await prisma.support.create({
      data: {
        battleId,
        teamId,
        amount: parseFloat(amount),
        currency: "USD",
        supporterName,
        message,
        paymentStatus: "pending",
        paymentGateway: "paypal",
      },
    });

    // 2. Define the return URL (where user goes after paying)
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const returnUrl = `${protocol}://${host}/b/${battleId}`;

    // 3. Create Order in PayPal
    const { orderId, checkoutUrl } = await createPayPalOrder(
      support.amount,
      support.id, // Using our DB ID as referenceId
      returnUrl
    );

    // 4. Update the Support with the PayPal Order ID
    await prisma.support.update({
      where: { id: support.id },
      data: {
        gatewayRef: orderId,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl,
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      { error: "Error al generar la orden de pago" },
      { status: 500 }
    );
  }
}
