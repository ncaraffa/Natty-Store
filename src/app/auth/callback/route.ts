import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/conta";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const supabase = await serverSupabase();

  if (!code || !supabase) {
    return NextResponse.redirect(new URL("/conta?auth=unavailable", url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(
    new URL(error ? "/conta?auth=failed" : next, url.origin),
  );
}
