import "server-only";

import { redirect } from "next/navigation";
import { serverSupabase } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function requireAdmin() {
  const supabase = await serverSupabase();
  const { data } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!data.user) redirect("/admin/login");
  if (!data.user.email || !allowed.includes(data.user.email.toLowerCase())) {
    redirect("/conta?auth=forbidden");
  }

  const db = adminSupabase();
  if (!db) throw new Error("Banco de dados administrativo indisponível.");

  return { user: data.user, db };
}
