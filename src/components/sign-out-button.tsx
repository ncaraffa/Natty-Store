"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserSupabase } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    const supabase = browserSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.refresh();
    setBusy(false);
  }

  return (
    <button type="button" onClick={handleSignOut} disabled={busy}>
      {busy ? "Saindo…" : "Sair da conta"}
    </button>
  );
}
