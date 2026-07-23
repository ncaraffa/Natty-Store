import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { fetchPayment } from "@/lib/mercado-pago";

export const dynamic = "force-dynamic";

function response(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function verifySignature(request: Request, dataId: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const signatureHeader = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");

  if (!secret || !signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=").map((piece) => piece.trim());
      return [key, value];
    }),
  );

  const ts = parts.ts;
  const receivedHash = parts.v1;
  if (!ts || !receivedHash) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expectedHash = createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const expected = Buffer.from(expectedHash, "utf8");
  const received = Buffer.from(receivedHash, "utf8");

  return (
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId =
    url.searchParams.get("data.id") || url.searchParams.get("id") || "";

  const body = await request.json().catch(() => null);
  const paymentId = dataId || body?.data?.id;

  if (!paymentId) {
    return response({ received: false, message: "missing payment id" }, 400);
  }

  if (!verifySignature(request, String(paymentId))) {
    console.error("Assinatura do webhook Mercado Pago inválida.");
    return response({ received: false, message: "invalid signature" }, 401);
  }

  const payment = await fetchPayment(paymentId);
  if (!payment) {
    return response({ received: false, message: "payment lookup failed" }, 502);
  }

  const orderId: string | undefined =
    payment.external_reference || payment.metadata?.order_id;

  if (!orderId) {
    console.error("Webhook sem external_reference associado.");
    return response({ received: true }, 200);
  }

  const admin = adminSupabase();
  if (!admin) {
    console.error("Cliente administrativo indisponível para processar webhook.");
    return response({ received: false }, 503);
  }

  if (payment.status === "approved") {
    const { data, error } = await admin.rpc("consume_stock_reservation", {
      p_order_id: orderId,
    });

    if (error) {
      console.error("Falha ao consumir reserva:", error.code);
      return response({ received: false }, 500);
    }

    if (!data) {
      console.error(
        "Reserva não pôde ser consumida (expirada ou já finalizada):",
        orderId,
      );
    }
  } else if (["rejected", "cancelled"].includes(payment.status)) {
    await admin.rpc("release_stock_reservation", {
      p_order_id: orderId,
      p_as_expired: false,
    });
    await admin
      .from("orders")
      .update({ payment_status: "rejected" })
      .eq("id", orderId);
  }

  return response({ received: true }, 200);
}
