import "server-only";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

type CreatePixInput = {
  orderId: string;
  totalCents: number;
  payerContact: string;
};

type CreatePixResult =
  | {
      ok: true;
      pix: {
        paymentId: number;
        status: string;
        qrCode: string;
        qrCodeBase64: string;
        expiresAt: string | null;
      };
    }
  | { ok: false; reason: string };

function payerEmail(contact: string) {
  const trimmed = contact.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    ? trimmed
    : "comprador@nattystore.com.br";
}

export async function createPixPayment(
  input: CreatePixInput,
): Promise<CreatePixResult> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");
    return { ok: false, reason: "not_configured" };
  }

  const response = await fetch(`${MERCADO_PAGO_API}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": input.orderId,
    },
    body: JSON.stringify({
      transaction_amount: Number((input.totalCents / 100).toFixed(2)),
      description: `Pedido Natty Store ${input.orderId}`,
      payment_method_id: "pix",
      payer: { email: payerEmail(input.payerContact) },
      external_reference: input.orderId,
      metadata: { order_id: input.orderId },
    }),
  }).catch(() => null);

  if (!response || !response.ok) {
    const body = await response?.text().catch(() => "");
    console.error("Falha ao criar pagamento Pix:", response?.status, body);
    return { ok: false, reason: "mp_request_failed" };
  }

  const data = await response.json().catch(() => null);
  const pointOfInteraction = data?.point_of_interaction?.transaction_data;

  if (!data?.id || !pointOfInteraction?.qr_code) {
    console.error("Resposta inesperada do Mercado Pago ao criar Pix.");
    return { ok: false, reason: "mp_invalid_response" };
  }

  return {
    ok: true,
    pix: {
      paymentId: data.id,
      status: data.status,
      qrCode: pointOfInteraction.qr_code,
      qrCodeBase64: pointOfInteraction.qr_code_base64,
      expiresAt: data.date_of_expiration ?? null,
    },
  };
}

export async function fetchPayment(paymentId: string | number) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");
    return null;
  }

  const response = await fetch(
    `${MERCADO_PAGO_API}/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  ).catch(() => null);

  if (!response || !response.ok) {
    console.error("Falha ao consultar pagamento no Mercado Pago:", paymentId);
    return null;
  }

  return response.json().catch(() => null);
}
