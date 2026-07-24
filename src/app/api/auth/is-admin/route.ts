import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await serverSupabase();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  const email = authData.user?.email?.toLowerCase();

  if (!email) {
    return NextResponse.json({ isAdmin: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return NextResponse.json(
    { isAdmin: allowed.includes(email) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
