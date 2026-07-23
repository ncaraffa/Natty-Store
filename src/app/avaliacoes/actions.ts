"use server";

import { revalidatePath } from "next/cache";
import { serverSupabase } from "@/lib/supabase/server";

export async function submitReview(formData: FormData) {
  const supabase = await serverSupabase();
  if (!supabase) throw new Error("Login indisponível no momento.");

  const orderId = String(formData.get("order_id") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!orderId) throw new Error("Pedido inválido.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Escolha de 1 a 5 estrelas.");
  }

  const { error } = await supabase.rpc("submit_review", {
    p_order_id: orderId,
    p_rating: rating,
    p_comment: comment || null,
  });

  if (error) {
    console.error("Falha ao registrar avaliação:", error.code);
    throw new Error("Não foi possível registrar sua avaliação agora.");
  }

  revalidatePath("/avaliacoes");
  revalidatePath("/conta");
}
