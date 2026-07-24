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

export type InventoryFormState = { error?: string; success?: string } | null;

export async function updateInventory(
  _prevState: InventoryFormState,
  formData: FormData,
): Promise<InventoryFormState> {
  try {
    const { db } = await requireAdmin();

    const productId = String(formData.get("product_id") ?? "");
    const onHand = Number(formData.get("on_hand"));
    const sellPolicy = String(formData.get("sell_policy") ?? "");
    const publicStatus = String(formData.get("public_status") ?? "");

    if (!productId) return { error: "Produto inválido." };
    if (!Number.isInteger(onHand) || onHand < 0) return { error: "Quantidade inválida." };
    if (!(sellPolicies as readonly string[]).includes(sellPolicy)) {
      return { error: "Política inválida." };
    }

    const validStatus = statusesByPolicy[sellPolicy as (typeof sellPolicies)[number]];
    if (!validStatus.includes(publicStatus)) {
      return { error: "Status público incompatível com a política escolhida." };
    }

    const { data: current, error: readError } = await db
      .from("inventory")
      .select("reserved")
      .eq("product_id", productId)
      .single();

    if (readError || !current) return { error: readError?.message ?? "Estoque não encontrado." };
    if (onHand < current.reserved) {
      return { error: `Quantidade não pode ser menor que a reservada (${current.reserved}).` };
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

    if (error) return { error: error.message };

    revalidatePath("/admin/estoque");
    revalidatePath("/");
    return { success: "Estoque atualizado." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha inesperada ao salvar estoque." };
  }
}
