import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { battleId, teamId, amount, currency, supporterName, message, handle, channelName, channelUrl, avatarUrl } = body;

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
    
    // Identity fields
    let safeHandle = handle ? String(handle).trim().substring(0, 30) : null;
    if (safeHandle && !safeHandle.startsWith("@")) safeHandle = "@" + safeHandle;
    const safeChannelName = channelName ? String(channelName).trim().substring(0, 50) : null;
    
    let safeChannelUrl = null;
    if (channelUrl) {
      try {
        const url = new URL(String(channelUrl).trim());
        if (url.protocol === "http:" || url.protocol === "https:") {
          safeChannelUrl = url.href.substring(0, 150);
        }
      } catch (e) {
        // Invalid URL, ignore it
      }
    }

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
    // The expiresAt is automatically handled by the database schema (NOW() + 30 mins),
    // but we'll fetch it to return.
    const support = await prisma.support.create({
      data: {
        battleId,
        teamId,
        amount: parseFloat(amount.toString()),
        currency: "USD",
        supporterName: safeSupporterName,
        message: safeMessage,
        handle: safeHandle,
        channelName: safeChannelName,
        channelUrl: safeChannelUrl,
        avatarUrl,
        paymentStatus: "pending"
      }
    });

    // 2. Prepare architecture for ePayco Sandbox
    // The frontend will use the support.id as the invoice reference.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
      ? process.env.NEXT_PUBLIC_BASE_URL 
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';

    const checkoutData = {
      invoice: support.id,
      amount: support.amount,
      name: `Participación en Batalla: ${battle.title}`,
      description: `Apoyo al equipo en la batalla ${battle.title}`,
      currency: "usd",
      tax_base: "0",
      tax: "0",
      country: "co",
      lang: "es",
      external: "true", // Sandbox true to open external
      confirmation: `${baseUrl}/api/webhook/epayco`,
      response: `${baseUrl}/b/${battle.id}`
    };

    // 3. Return response
    return NextResponse.json({ 
      support, 
      checkoutData,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating support:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
