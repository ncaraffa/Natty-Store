import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const requestSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    robloxNick: z.string().trim().min(3).max(80),
    contact: z.string().trim().min(5).max(200),
    game: z.enum(["mm2", "ftf", "adopt-me", "other"]),
    request: z.string().trim().min(5).max(2000),
    website: z.string().max(0).optional().default(""),
  })
  .strict();

type RateEntry = {
  count: number;
  resetAt: number;
};

const globalRateLimit = globalThis as typeof globalThis & {
  nattyCustomRequestRateLimit?: Map<string, RateEntry>;
};

const rateLimit =
  globalRateLimit.nattyCustomRequestRateLimit ?? new Map<string, RateEntry>();

globalRateLimit.nattyCustomRequestRateLimit = rateLimit;

function clientIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();

  return firstForwarded || request.headers.get("x-real-ip") || "local";
}

function exceedsRateLimit(identifier: string) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maximumRequests = 5;
  const current = rateLimit.get(identifier);

  if (!current || current.resetAt <= now) {
    rateLimit.set(identifier, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  rateLimit.set(identifier, current);
  return current.count > maximumRequests;
}

function response(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const expectedOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");

  if (!origin || origin !== expectedOrigin) {
    return response("Solicitação não autorizada.", 403);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return response("Formato de solicitação inválido.", 415);
  }

  if (exceedsRateLimit(clientIdentifier(request))) {
    return response(
      "Muitas tentativas em pouco tempo. Aguarde alguns minutos.",
      429,
    );
  }

  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return response("Confira os campos e tente novamente.", 400);
  }

  // Campo-isca contra robôs. A resposta não revela que o envio foi descartado.
  if (parsed.data.website) {
    return response("Solicitação recebida para análise.", 201);
  }

  const supabase = adminSupabase();
  if (!supabase) {
    console.error("Cliente administrativo do Supabase não configurado.");
    return response("Não foi possível salvar a solicitação agora.", 503);
  }

  const { error } = await supabase.from("custom_requests").insert({
    name: parsed.data.name,
    roblox_nick: parsed.data.robloxNick,
    contact: parsed.data.contact,
    game: parsed.data.game,
    request: parsed.data.request,
  });

  if (error) {
    console.error("Falha ao salvar encomenda:", { code: error.code });
    return response("Não foi possível salvar a solicitação agora.", 500);
  }

  return response("Solicitação recebida para análise.", 201);
}
