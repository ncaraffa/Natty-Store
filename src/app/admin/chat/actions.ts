"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

const CHAT_IMAGES_BUCKET = "chat-images";

export async function replyToConversation(formData: FormData) {
  const { db } = await requireAdmin();

  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("image");

  if (!conversationId) throw new Error("Conversa inválida.");
  if (!body && !(file instanceof File && file.size > 0)) {
    throw new Error("Escreva uma mensagem ou envie uma imagem.");
  }
  if (body.length > 4000) throw new Error("Mensagem muito longa.");

  let imageUrl: string | null = null;
  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext || "jpg"}`;
    const { error: uploadError } = await db.storage
      .from(CHAT_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type || "image/jpeg" });

    if (!uploadError) {
      imageUrl = db.storage.from(CHAT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
    }
  }

  const { error } = await db.from("chat_messages").insert({
    conversation_id: conversationId,
    sender_role: "admin",
    body: body || null,
    image_url: imageUrl,
  });

  if (error) throw new Error(error.message);

  await db
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      unread_by_customer: true,
      unread_by_admin: false,
      status: "open",
    })
    .eq("id", conversationId);

  revalidatePath("/admin/chat");
  revalidatePath(`/admin/chat/${conversationId}`);
}

export async function setConversationStatus(formData: FormData) {
  const { db } = await requireAdmin();

  const conversationId = String(formData.get("conversation_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!conversationId) throw new Error("Conversa inválida.");
  if (status !== "open" && status !== "closed") throw new Error("Status inválido.");

  const { error } = await db.from("conversations").update({ status }).eq("id", conversationId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/chat");
  revalidatePath(`/admin/chat/${conversationId}`);
}
