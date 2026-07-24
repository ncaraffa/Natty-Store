"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import type { SupabaseClient } from "@supabase/supabase-js";

const kinds = ["promo", "news", "notice", "event"] as const;
const BANNER_IMAGES_BUCKET = "banner-images";

function parseDate(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function resolveImageUrl(db: SupabaseClient, formData: FormData, fallback: string) {
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;

    const { error } = await db.storage
      .from(BANNER_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type || "image/jpeg" });

    if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);

    const { data } = db.storage.from(BANNER_IMAGES_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
  return fallback;
}

export async function createBanner(formData: FormData) {
  const { db } = await requireAdmin();

  const kind = String(formData.get("kind") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const linkUrl = String(formData.get("link_url") ?? "").trim();
  const imageUrlInput = String(formData.get("image_url") ?? "").trim();

  if (!(kinds as readonly string[]).includes(kind)) throw new Error("Tipo de banner inválido.");
  if (!title || title.length > 150) throw new Error("Título inválido.");
  if (message.length > 500) throw new Error("Mensagem muito longa.");

  const imageUrl = await resolveImageUrl(db, formData, imageUrlInput);

  const { error } = await db.from("banners").insert({
    kind,
    title,
    message,
    link_url: linkUrl || null,
    image_url: imageUrl || null,
    starts_at: parseDate(formData.get("starts_at")),
    ends_at: parseDate(formData.get("ends_at")),
    active: formData.get("active") === "on",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function updateBanner(formData: FormData) {
  const { db } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const linkUrl = String(formData.get("link_url") ?? "").trim();
  const imageUrlInput = String(formData.get("image_url") ?? "").trim();

  if (!id) throw new Error("Banner inválido.");
  if (!(kinds as readonly string[]).includes(kind)) throw new Error("Tipo de banner inválido.");
  if (!title || title.length > 150) throw new Error("Título inválido.");
  if (message.length > 500) throw new Error("Mensagem muito longa.");

  const imageUrl = await resolveImageUrl(db, formData, imageUrlInput);

  const { error } = await db
    .from("banners")
    .update({
      kind,
      title,
      message,
      link_url: linkUrl || null,
      image_url: imageUrl || null,
      starts_at: parseDate(formData.get("starts_at")),
      ends_at: parseDate(formData.get("ends_at")),
      active: formData.get("active") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBanner(formData: FormData) {
  const { db } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Banner inválido.");

  const { error } = await db.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}
