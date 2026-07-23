"use client";

import { FormEvent, useState } from "react";
import { browserSupabase } from "@/lib/supabase/client";

type AuthPanelProps = {
  title?: string;
  next?: string;
};

export function AuthPanel({ title = "Entrar por e-mail", next = "/conta" }: AuthPanelProps) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const supabase = browserSupabase();
    if (!supabase) {
      setMessage("Login ainda não configurado. A loja continua em ambiente de desenvolvimento.");
      setBusy(false);
      return;
    }

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo.toString() },
    });

    setMessage(
      error
        ? "Não foi possível enviar o acesso. Confira o e-mail e tente novamente."
        : "Enviamos um link seguro para seu e-mail. Abra-o neste dispositivo.",
    );
    setBusy(false);
  }

  return (
    <form onSubmit={submit}>
      <h2>{title}</h2>
      <p>Você receberá um link temporário. Nenhuma senha é armazenada pela Natty Store.</p>
      <label>
        E-mail
        <input name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <button disabled={busy}>{busy ? "Enviando…" : "Enviar link de acesso"}</button>
      {message && <div className="notice" role="status" aria-live="polite">{message}</div>}
    </form>
  );
}
