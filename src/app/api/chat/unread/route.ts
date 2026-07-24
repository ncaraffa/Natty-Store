import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await serverSupabase();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!supabase || !authData.user) {
    return NextResponse.json({ unread: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const { data } = await supabase
    .from("conversations")
    .select("unread_by_customer")
    .maybeSingle();

  return NextResponse.json(
    { unread: Boolean(data?.unread_by_customer) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
