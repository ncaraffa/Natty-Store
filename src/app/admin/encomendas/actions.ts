"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

const requestStatuses = [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "completed",
] as const;

export async function updateCustomRequestStatus(formData: FormData) {
  const { db } = await requireAdmin();

  const requestId = String(formData.get("request_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!requestId) throw new Error("Encomenda inválida.");
  if (!(requestStatuses as readonly string[]).includes(status)) {
    throw new Error("Status inválido.");
  }

  const { error } = await db
    .from("custom_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/encomendas");
}
