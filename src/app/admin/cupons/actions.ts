"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

const discountTypes = ["percent", "fixed"] as const;

function parseDate(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function createCoupon(formData: FormData) {
  const { db } = await requireAdmin();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountType = String(formData.get("discount_type") ?? "");
  const discountValue = Number(formData.get("discount_value") ?? "");
  const maxUsesRaw = String(formData.get("max_uses") ?? "").trim();
  const minOrderReais = String(formData.get("min_order") ?? "0").replace(",", ".");
  const minOrderCents = Math.round((Number(minOrderReais) || 0) * 100);

  if (!code || code.length > 40) throw new Error("Código inválido.");
  if (!(discountTypes as readonly string[]).includes(discountType)) throw new Error("Tipo inválido.");
  if (!Number.isFinite(discountValue) || discountValue <= 0) throw new Error("Valor de desconto inválido.");
  if (discountType === "percent" && discountValue > 100) throw new Error("Desconto percentual não pode passar de 100.");

  const { error } = await db.from("coupons").insert({
    code,
    discount_type: discountType,
    discount_value: Math.round(discountValue),
    active: formData.get("active") === "on",
    starts_at: parseDate(formData.get("starts_at")),
    ends_at: parseDate(formData.get("ends_at")),
    max_uses: maxUsesRaw ? Number(maxUsesRaw) : null,
    min_order_cents: minOrderCents,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/cupons");
}

export async function updateCoupon(formData: FormData) {
  const { db } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const discountType = String(formData.get("discount_type") ?? "");
  const discountValue = Number(formData.get("discount_value") ?? "");
  const maxUsesRaw = String(formData.get("max_uses") ?? "").trim();
  const minOrderReais = String(formData.get("min_order") ?? "0").replace(",", ".");
  const minOrderCents = Math.round((Number(minOrderReais) || 0) * 100);

  if (!id) throw new Error("Cupom inválido.");
  if (!(discountTypes as readonly string[]).includes(discountType)) throw new Error("Tipo inválido.");
  if (!Number.isFinite(discountValue) || discountValue <= 0) throw new Error("Valor de desconto inválido.");
  if (discountType === "percent" && discountValue > 100) throw new Error("Desconto percentual não pode passar de 100.");

  const { error } = await db
    .from("coupons")
    .update({
      discount_type: discountType,
      discount_value: Math.round(discountValue),
      active: formData.get("active") === "on",
      starts_at: parseDate(formData.get("starts_at")),
      ends_at: parseDate(formData.get("ends_at")),
      max_uses: maxUsesRaw ? Number(maxUsesRaw) : null,
      min_order_cents: minOrderCents,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/cupons");
}

export async function deleteCoupon(formData: FormData) {
  const { db } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Cupom inválido.");

  const { error } = await db.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cupons");
}
