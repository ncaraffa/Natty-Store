import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";
import { serverSupabase } from "@/lib/supabase/server";
import { createPixPayment } from "@/lib/mercado-pago";

export const dynamic = "force-dynamic";

const schema = z
  .object({
    attemptId: z.string().uuid(),
    robloxNick: z.string().trim().min(3).max(80),
    contact: z.string().trim().min(5).max(200),
    items: z
      .array(
        z
          .object({
            productId: z.string().uuid(),
            quantity: z.number().int().min(1).max(99),
          })
          .strict(),
      )
      .min(1)
      .max(30),
  })
  .strict();

type RateEntry = {
  count: number;
  resetAt: number;
};

const globalRateLimit = globalThis as typeof globalThis & {
  nattyCheckoutRateLimit?: Map<string, RateEntry>;
};

const rateLimit =
  globalRateLimit.nattyCheckoutRateLimit ?? new Map<string, RateEntry>();

globalRateLimit.nattyCheckoutRateLimit = rateLimit;

function clientIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();

  return firstForwarded || request.headers.get("x-real-ip") || "local";
}

function exceedsRateLimit(identifier: string) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maximumRequests = 10;
  const current = rateLimit.get(identifier);

  if (!current || current.resetAt <= now) {
    rateLimit.set(identifier, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  rateLimit.set(identifier, current);
  return current.count > maximumRequests;
}

function response(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function serverIdempotencyKey(attemptId: string, authUserId: string | null) {
  const digest = createHash("sha256")
    .update("natty-demo-order-v1")
    .update("\0")
    .update(attemptId)
    .update("\0")
    .update(authUserId ?? "guest")
    .digest("hex");

  return `demo_${digest}`;
}

const resultSchema = z.object({
  order_id: z.string().uuid(),
  order_status: z.string(),
  payment_status: z.string(),
  total_cents: z.number().int().nonnegative(),
  reservation_expires_at: z.string().nullable(),
});

export async function POST(request: Request) {
  const expectedOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");

  if (!origin || origin !== expectedOrigin) {
    return response({ message: "Solicitação não autorizada." }, 403);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return response({ message: "Formato de solicitação inválido." }, 415);
  }

  if (exceedsRateLimit(clientIdentifier(request))) {
    return response(
      { message: "Muitas tentativas em pouco tempo. Aguarde alguns minutos." },
      429,
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return response(
      { message: "Confira nick, contato e itens do carrinho." },
      400,
    );
  }

  const sessionClient = await serverSupabase();
  const { data: authData } = sessionClient
    ? await sessionClient.auth.getUser()
    : { data: { user: null } };

  const authUserId = authData.user?.id ?? null;
  const admin = adminSupabase();

  if (!admin) {
    console.error("Cliente administrativo do Supabase não configurado.");
    return response(
      { message: "Não foi possível criar o pedido agora." },
      503,
    );
  }

  const { data, error } = await admin.rpc("reserve_checkout", {
    p_idempotency_key: serverIdempotencyKey(
      parsed.data.attemptId,
      authUserId,
    ),
    p_guest_roblox_nick: parsed.data.robloxNick,
    p_guest_contact: parsed.data.contact,
    p_items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  });

  if (error) {
    console.error("Falha ao criar pedido demonstrativo:", {
      code: error.code,
    });

    if (
      error.message.includes("product unavailable") ||
      error.message.includes("insufficient stock")
    ) {
      return response(
        {
          message:
            "Um item não está disponível para este pedido. Atualize o carrinho.",
        },
        409,
      );
    }

    if (error.message.includes("idempotency key")) {
      return response(
        {
          message:
            "Esta tentativa já foi utilizada. Atualize a página e tente novamente.",
        },
        409,
      );
    }

    return response(
      { message: "Não foi possível criar o pedido agora." },
      500,
    );
  }

  const first = Array.isArray(data) ? data[0] : data;
  const result = resultSchema.safeParse(first);

  if (!result.success) {
    console.error(
      "Resposta inesperada da função reserve_checkout.",
      JSON.stringify(first),
    );
    return response(
      { message: "Não foi possível confirmar o pedido agora." },
      500,
    );
  }

  const payment = await createPixPayment({
    orderId: result.data.order_id,
    totalCents: result.data.total_cents,
    payerContact: parsed.data.contact,
  });

  if (!payment.ok) {
    await admin.rpc("release_stock_reservation", {
      p_order_id: result.data.order_id,
      p_as_expired: false,
    });
    return response(
      { message: "Não foi possível gerar o Pix agora. Tente novamente." },
      502,
    );
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({
      payment_provider: "mercado_pago",
      provider_payment_id: String(payment.pix.paymentId),
      payment_status: "pending",
    })
    .eq("id", result.data.order_id);

  if (updateError) {
    console.error("Falha ao salvar pagamento no pedido:", updateError.code);
  }

  return response(
    {
      message: "Reserva criada. Pague o Pix antes de expirar.",
      order: {
        id: result.data.order_id,
        status: result.data.order_status,
        totalCents: result.data.total_cents,
        reservationExpiresAt: result.data.reservation_expires_at,
      },
      pix: payment.pix,
    },
    201,
  );
}
