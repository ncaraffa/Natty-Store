"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverSupabase } from "@/lib/supabase/server";

const CHAT_IMAGES_BUCKET = "chat-images";

async function uploadChatImage(
  supabase: Awaited<ReturnType<typeof serverSupabase>>,
  file: File,
) {
  if (!supabase) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext || "jpg"}`;

  const { error } = await supabase.storage
    .from(CHAT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type || "image/jpeg" });

  if (error) return null;

  const { data } = supabase.storage.from(CHAT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function ensureConversation() {
  const supabase = await serverSupabase();
  if (!supabase) redirect("/conta");

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/conta");

  let { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (!customer) {
    const emailPrefix = (authData.user.email ?? "cliente").split("@")[0];
    const inserted = await supabase
      .from("customers")
      .insert({
        auth_user_id: authData.user.id,
        roblox_nick: emailPrefix.slice(0, 80),
        contact: authData.user.email ?? "",
      })
      .select("id")
      .single();
    customer = inserted.data;
  }

  if (!customer) redirect("/conta");

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", customer.id)
    .maybeSingle();

  if (conversation) return conversation.id as string;

  const created = await supabase
    .from("conversations")
    .insert({ customer_id: customer.id })
    .select("id")
    .single();

  return created.data?.id as string;
}

export async function sendCustomerMessage(formData: FormData) {
  const supabase = await serverSupabase();
  if (!supabase) throw new Error("Chat indisponível no momento.");

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
    imageUrl = await uploadChatImage(supabase, file);
  }

  const { error } = await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    sender_role: "customer",
    body: body || null,
    image_url: imageUrl,
  });

  if (error) throw new Error("Não foi possível enviar a mensagem.");

  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      unread_by_admin: true,
      unread_by_customer: false,
      status: "open",
    })
    .eq("id", conversationId);

  revalidatePath("/chat");
}

export async function closeConversationByCustomer(formData: FormData) {
  const supabase = await serverSupabase();
  if (!supabase) throw new Error("Chat indisponível no momento.");

  const conversationId = String(formData.get("conversation_id") ?? "");
  if (!conversationId) throw new Error("Conversa inválida.");

  await supabase
    .from("conversations")
    .update({ status: "closed" })
    .eq("id", conversationId);

  revalidatePath("/chat");
}

export async function markConversationReadByCustomer(conversationId: string) {
  const supabase = await serverSupabase();
  if (!supabase) return;

  await supabase
    .from("conversations")
    .update({ unread_by_customer: false })
    .eq("id", conversationId);
}
