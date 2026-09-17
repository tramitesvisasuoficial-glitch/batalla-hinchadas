import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
// En producción deberías verificar la firma del webhook con la API de PayPal
// usando paypal-rest-sdk o manualmente. Por simplicidad de la demo, confiaremos en el payload
// pero consultaremos la API de PayPal para verificar el estado de la orden por seguridad.
import { verifyPayPalOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // PayPal envia diferentes tipos de eventos
    // Nos interesa CHECKOUT.ORDER.APPROVED o PAYMENT.CAPTURE.COMPLETED
    const eventType = body.event_type;
    const resource = body.resource;

    if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = eventType === "CHECKOUT.ORDER.APPROVED" 
        ? resource.id 
        : resource.supplementary_data?.related_ids?.order_id; // Si es un capture, el order_id viene adentro

      if (!orderId) {
        return NextResponse.json({ received: true });
      }

      // Verificación de servidor a servidor (Seguridad e Idempotencia)
      const orderDetails = await verifyPayPalOrder(orderId);
      
      if (orderDetails.status === "COMPLETED" || orderDetails.status === "APPROVED") {
        // Encontramos el Support en la base de datos
        const support = await prisma.support.findUnique({
          where: { gatewayRef: orderId },
        });

        // Verificamos idempotencia: solo actualizamos si está pending
        if (support && support.paymentStatus === "pending") {
          await prisma.support.update({
            where: { id: support.id },
            data: {
              paymentStatus: "paid",
            },
          });
          
          console.log(`[PayPal Webhook] Pago confirmado para Support ID: ${support.id}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
