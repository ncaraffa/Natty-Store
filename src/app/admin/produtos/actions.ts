"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

const categories = ["mm2", "ftf", "adopt-me"] as const;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function createProduct(formData: FormData) {
  const { db } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const priceReais = String(formData.get("price") ?? "").replace(",", ".");
  const priceCents = Math.round(Number(priceReais) * 100);
  const imageUrl = String(formData.get("image_url") ?? "").trim();

  if (!name || name.length > 120) throw new Error("Nome inválido.");
  if (!(categories as readonly string[]).includes(category)) throw new Error("Categoria inválida.");
  if (!Number.isFinite(priceCents) || priceCents < 0) throw new Error("Preço inválido.");

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
      active: false,
    })
    .select("id")
    .single();

  if (error || !product) throw new Error(error?.message ?? "Falha ao criar produto.");

  const { error: invError } = await db.from("inventory").insert({
    product_id: product.id,
    on_hand: 0,
    reserved: 0,
    sell_policy: "disabled",
    public_status: "unavailable",
  });

  if (invError) throw new Error(invError.message);

  revalidatePath("/admin/produtos");
  revalidatePath("/admin/estoque");
}

export async function updateProduct(formData: FormData) {
  const { db } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const priceReais = String(formData.get("price") ?? "").replace(",", ".");
  const priceCents = Math.round(Number(priceReais) * 100);
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!id) throw new Error("Produto inválido.");
  if (!name || name.length > 120) throw new Error("Nome inválido.");
  if (!(categories as readonly string[]).includes(category)) throw new Error("Categoria inválida.");
  if (!Number.isFinite(priceCents) || priceCents < 0) throw new Error("Preço inválido.");

  const { error } = await db
    .from("products")
    .update({
      name,
      description,
      category,
      price_cents: priceCents,
      image_url: imageUrl || null,
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
