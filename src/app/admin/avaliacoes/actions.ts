"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

export async function replyToReview(formData: FormData) {
  const { db } = await requireAdmin();

  const reviewId = String(formData.get("review_id") ?? "");
  const reply = String(formData.get("admin_reply") ?? "").trim();

  if (!reviewId) throw new Error("Avaliação inválida.");
  if (reply.length > 2000) throw new Error("Resposta muito longa.");

  const { error } = await db
    .from("reviews")
    .update({
      admin_reply: reply || null,
      admin_reply_at: reply ? new Date().toISOString() : null,
    })
    .eq("id", reviewId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/avaliacoes");
  revalidatePath("/avaliacoes");
}
