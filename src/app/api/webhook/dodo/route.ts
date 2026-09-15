import { Webhooks } from "@dodopayments/nextjs";
import { prisma } from "@/lib/prisma";

// The `@dodopayments/nextjs` SDK automatically handles signature verification 
// and idempotency headers for us through the `Webhooks` handler.

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || "ZHVtbXlfd2ViaG9va19rZXk=",
  onPaymentSucceeded: async (payload: any) => {
    try {
      console.log("Webhook Dodo received: Payment Succeeded");
      
      // Extract the reference_id that we passed in metadata when creating the checkout session
      const supportId = payload?.data?.metadata?.reference_id || payload?.metadata?.reference_id;
      
      if (!supportId) {
        console.error("No reference_id found in metadata");
        return;
      }

      // We verify the support exists
      const existingSupport = await prisma.support.findUnique({
        where: { id: supportId }
      });

      if (!existingSupport) {
        console.error(`Support with ID ${supportId} not found`);
        return;
      }

      // Idempotency check: if it's already paid, do nothing
      if (existingSupport.paymentStatus === "paid") {
        console.log(`Support ${supportId} is already paid. Ignoring duplicate webhook.`);
        return;
      }

      // Update to paid
      await prisma.support.update({
        where: { id: supportId },
        data: { paymentStatus: "paid" }
      });
      
      console.log(`Support ${supportId} successfully marked as paid.`);
    } catch (error) {
      console.error("Error processing Dodo webhook:", error);
    }
  }
});
