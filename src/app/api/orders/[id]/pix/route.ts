import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
import { fetchPayment } from "@/lib/mercado-pago";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  payment_status: string;
  provider_payment_id: string | null;
};

function response(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await serverSupabase();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!supabase || !authData.user) {
    return response({ message: "Entre na sua conta para continuar." }, 401);
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id,payment_status,provider_payment_id")
    .eq("id", id)
    .maybeSingle();

  const order = data as OrderRow | null;

  if (error || !order) {
    return response({ message: "Pedido não encontrado." }, 404);
  }

  if (order.payment_status !== "pending" && order.payment_status !== "not_started") {
    return response(
      { message: "Este pedido não tem pagamento pendente.", paymentStatus: order.payment_status },
      200,
    );
  }

  if (!order.provider_payment_id) {
    return response(
      { message: "O Pix ainda não foi gerado para este pedido." },
      200,
    );
  }

  const payment = await fetchPayment(order.provider_payment_id);
  const pointOfInteraction = payment?.point_of_interaction?.transaction_data;

  if (!payment || !pointOfInteraction?.qr_code) {
    return response(
      { message: "Não foi possível recuperar o Pix agora. Tente novamente." },
      502,
    );
  }

  return response(
    {
      pix: {
        qrCode: pointOfInteraction.qr_code,
        qrCodeBase64: pointOfInteraction.qr_code_base64,
        expiresAt: payment.date_of_expiration ?? null,
      },
      paymentStatus: payment.status,
    },
    200,
  );
}
