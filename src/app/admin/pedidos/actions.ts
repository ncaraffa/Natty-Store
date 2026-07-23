"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

const manualStatuses = ["delivering", "completed", "cancelled"] as const;

export async function updateOrderStatus(formData: FormData) {
  const { db } = await requireAdmin();

  const orderId = String(formData.get("order_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!orderId) throw new Error("Pedido inválido.");
  if (!(manualStatuses as readonly string[]).includes(status)) throw new Error("Status inválido.");

  const { data: order, error: readError } = await db
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (readError || !order) throw new Error(readError?.message ?? "Pedido não encontrado.");
  if (order.status !== "paid" && order.status !== "delivering") {
    throw new Error("Só é possível alterar pedidos pagos ou em entrega.");
  }

  const { error } = await db
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/pedidos");
}
