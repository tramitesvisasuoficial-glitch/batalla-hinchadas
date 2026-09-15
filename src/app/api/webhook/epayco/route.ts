import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // ePayco usually sends webhook data as x-www-form-urlencoded or application/json.
    // If it comes via x-www-form-urlencoded (standard), we need to handle it.
    let body: any;
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    }

    const {
      x_cust_id_cliente,
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature,
      x_id_invoice,
      x_response,
      x_transaction_state,
      x_transaction_date,
      x_test_request
    } = body;

    // 1. Validate variables exist
    if (!x_ref_payco || !x_signature || !x_id_invoice) {
      return NextResponse.json({ error: "Missing required ePayco parameters" }, { status: 400 });
    }

    // 1.5 Validate Test Environment Security
    const isTestMode = process.env.EPAYCO_TEST_MODE === "true";
    const isTestRequest = x_test_request === true || x_test_request === "TRUE" || x_test_request === "true";

    if (isTestMode && !isTestRequest) {
      console.error("Transacción de producción bloqueada en entorno Sandbox");
      return NextResponse.json({ error: "Environment mismatch (Sandbox expected)" }, { status: 403 });
    }
    
    if (!isTestMode && isTestRequest) {
      console.error("Transacción Sandbox bloqueada en entorno de Producción");
      return NextResponse.json({ error: "Environment mismatch (Production expected)" }, { status: 403 });
    }

    const p_cust_id_cliente = (process.env.EPAYCO_P_CUST_ID_CLIENTE || "").trim();
    const p_key = (process.env.EPAYCO_P_KEY || "").trim();

    // 2. Validate Signature
    const signatureString = `${p_cust_id_cliente}^${p_key}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`;
    const expectedSignature = crypto.createHash("sha256").update(signatureString).digest("hex");

    if (expectedSignature !== x_signature) {
      console.error("Firma inválida en webhook", { expectedSignature, x_signature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 3. Locate Support
    const support = await prisma.support.findUnique({
      where: { id: x_id_invoice }
    });

    if (!support) {
      console.error("Support no encontrado para la factura:", x_id_invoice);
      return NextResponse.json({ error: "Support not found" }, { status: 404 });
    }

    // 4. Idempotency & Uniqueness
    // If already paid and refPayco matches, we simply return 200 (idempotent success).
    if (support.paymentStatus === "paid" && support.refPayco === x_ref_payco) {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // Check if another support has this refPayco
    const existingRef = await prisma.support.findFirst({
      where: { refPayco: x_ref_payco, id: { not: support.id } }
    });
    if (existingRef) {
      return NextResponse.json({ error: "Reference already used in another support" }, { status: 400 });
    }

    // 5. Validate Amount and Currency
    if (parseFloat(x_amount) !== support.amount || x_currency_code.toUpperCase() !== support.currency) {
      return NextResponse.json({ error: "Amount or currency mismatch" }, { status: 400 });
    }

    // 6. Time Validity (ExpiresAt)
    // The policy: x_transaction_date from ePayco must be BEFORE or EQUAL to support.expiresAt
    const transactionDate = new Date(x_transaction_date);
    if (transactionDate > support.expiresAt) {
      // It was paid after the intent expired
      // This is a complex situation. We'll mark it as failed/expired.
      await prisma.support.update({
        where: { id: support.id },
        data: {
          paymentResponse: "Pagado pero expirado",
          paymentCode: parseInt(x_transaction_state, 10) || 0,
          refPayco: x_ref_payco,
          transactionId: x_transaction_id,
          paymentDate: transactionDate,
        }
      });
      return NextResponse.json({ message: "Transaction accepted by ePayco but expired in our system" }, { status: 200 });
    }

    // 7. Status Check
    // ePayco status: 1 = Aceptada, 2 = Rechazada, 3 = Pendiente, 4 = Fallida
    const stateCode = parseInt(x_transaction_state, 10);
    const isAccepted = stateCode === 1 || x_response === "Aceptada";

    if (isAccepted) {
      // Mark as Paid
      await prisma.support.update({
        where: { id: support.id },
        data: {
          paymentStatus: "paid",
          refPayco: x_ref_payco,
          transactionId: x_transaction_id,
          paymentResponse: x_response,
          paymentCode: stateCode,
          paymentDate: transactionDate
        }
      });
    } else {
      // Just record the failed/rejected state but keep paymentStatus as "pending" or "failed".
      // Our app treats everything except "paid" as not summed.
      await prisma.support.update({
        where: { id: support.id },
        data: {
          refPayco: x_ref_payco,
          transactionId: x_transaction_id,
          paymentResponse: x_response,
          paymentCode: stateCode,
          paymentDate: transactionDate
        }
      });
    }

    return NextResponse.json({ message: "Webhook processed correctly" }, { status: 200 });

  } catch (error) {
    console.error("Error processing ePayco webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
