"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import type { SupabaseClient } from "@supabase/supabase-js";

const categories = ["mm2", "ftf", "adopt-me"] as const;
const badges = ["", "new", "promo", "bestseller", "featured"] as const;
const PRODUCT_IMAGES_BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5_000_000;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export type ProductFormState = { error?: string; success?: string } | null;

async function uploadProductImage(db: SupabaseClient, file: File) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Imagem muito grande (limite de 5 MB).");
  }
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Formato de imagem não suportado (${file.type || "desconhecido"}). Use PNG, JPEG, WEBP ou GIF.`,
    );
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;

  const { error } = await db.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type || "image/jpeg" });

  if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);

  const { data } = db.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function resolveImageUrl(db: SupabaseClient, formData: FormData, fallback: string) {
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    return uploadProductImage(db, file);
  }
  return fallback;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    const { db } = await requireAdmin();

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const priceReais = String(formData.get("price") ?? "").replace(",", ".");
    const priceCents = Math.round(Number(priceReais) * 100);
    const imageUrlInput = String(formData.get("image_url") ?? "").trim();
    const badge = String(formData.get("badge") ?? "");

    if (!name || name.length > 120) return { error: "Nome inválido." };
    if (!(categories as readonly string[]).includes(category)) return { error: "Categoria inválida." };
    if (!Number.isFinite(priceCents) || priceCents < 0) return { error: "Preço inválido." };
    if (!(badges as readonly string[]).includes(badge)) return { error: "Selo inválido." };

    const imageUrl = await resolveImageUrl(db, formData, imageUrlInput);
    const slug = `${slugify(name)}-${Date.now().toString(36)}`;

    const { data: product, error } = await db
      .from("products")
      .insert({
        slug,
        name,
        description,
        category,
        price_cents: priceCents,
        image_url: imageUrl || null,
        badge: badge || null,
        active: false,
      })
      .select("id")
      .single();

    if (error || !product) return { error: error?.message ?? "Falha ao criar produto." };

    const { error: invError } = await db.from("inventory").insert({
      product_id: product.id,
      on_hand: 0,
      reserved: 0,
      sell_policy: "disabled",
      public_status: "unavailable",
    });

    if (invError) return { error: invError.message };

    revalidatePath("/admin/produtos");
    revalidatePath("/admin/estoque");
    return { success: `Produto "${name}" criado. Ative-o na tabela abaixo quando estiver pronto.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha inesperada ao criar produto." };
  }
}

export async function updateProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    const { db } = await requireAdmin();

    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const priceReais = String(formData.get("price") ?? "").replace(",", ".");
    const priceCents = Math.round(Number(priceReais) * 100);
    const imageUrlInput = String(formData.get("image_url") ?? "").trim();
    const active = formData.get("active") === "on";
    const badge = String(formData.get("badge") ?? "");

    if (!id) return { error: "Produto inválido." };
    if (!name || name.length > 120) return { error: "Nome inválido." };
    if (!(categories as readonly string[]).includes(category)) return { error: "Categoria inválida." };
    if (!Number.isFinite(priceCents) || priceCents < 0) return { error: "Preço inválido." };
    if (!(badges as readonly string[]).includes(badge)) return { error: "Selo inválido." };

    const imageUrl = await resolveImageUrl(db, formData, imageUrlInput);

    const { error } = await db
      .from("products")
      .update({
        name,
        description,
        category,
        price_cents: priceCents,
        image_url: imageUrl || null,
        badge: badge || null,
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/produtos");
    revalidatePath("/");
    return { success: `"${name}" salvo.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha inesperada ao salvar produto." };
  }
}
