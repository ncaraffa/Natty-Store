"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserSupabase } from "@/lib/supabase/client";

export function SwitchAccountButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSwitch() {
    setBusy(true);
    const supabase = browserSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.refresh();
    setBusy(false);
  }

  return (
    <button type="button" className="button ghost" onClick={handleSwitch} disabled={busy}>
      {busy ? "Trocando…" : "Trocar de conta"}
    </button>
  );
}
