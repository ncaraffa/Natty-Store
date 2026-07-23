"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

const sellPolicies = ["in_stock", "preorder", "backorder", "disabled"] as const;
const statusesByPolicy: Record<(typeof sellPolicies)[number], readonly string[]> = {
  in_stock: ["available", "limited", "unavailable"],
  preorder: ["preorder"],
  backorder: ["backorder"],
  disabled: ["unavailable"],
};

export async function updateInventory(formData: FormData) {
  const { db } = await requireAdmin();

  const productId = String(formData.get("product_id") ?? "");
  const onHand = Number(formData.get("on_hand"));
  const sellPolicy = String(formData.get("sell_policy") ?? "");
  const publicStatus = String(formData.get("public_status") ?? "");

  if (!productId) throw new Error("Produto inválido.");
  if (!Number.isInteger(onHand) || onHand < 0) throw new Error("Quantidade inválida.");
  if (!(sellPolicies as readonly string[]).includes(sellPolicy)) throw new Error("Política inválida.");

  const validStatus = statusesByPolicy[sellPolicy as (typeof sellPolicies)[number]];
  if (!validStatus.includes(publicStatus)) {
    throw new Error("Status público incompatível com a política escolhida.");
  }

  const { data: current, error: readError } = await db
    .from("inventory")
    .select("reserved")
    .eq("product_id", productId)
    .single();

  if (readError || !current) throw new Error(readError?.message ?? "Estoque não encontrado.");
  if (onHand < current.reserved) {
    throw new Error(`Quantidade não pode ser menor que a reservada (${current.reserved}).`);
  }

  const { error } = await db
    .from("inventory")
    .update({
      on_hand: onHand,
      sell_policy: sellPolicy,
      public_status: publicStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("product_id", productId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/estoque");
  revalidatePath("/");
}
