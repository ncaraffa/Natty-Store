"use client";

import { FormEvent, useState } from "react";

export default function Orders() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          robloxNick: String(data.get("robloxNick") ?? ""),
          contact: String(data.get("contact") ?? ""),
          game: String(data.get("game") ?? ""),
          request: String(data.get("request") ?? ""),
          website: String(data.get("website") ?? ""),
        }),
      });

      const body: unknown = await response.json().catch(() => null);
      const returnedMessage =
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string"
          ? body.message
          : "Não foi possível concluir o envio.";

      setMessage(returnedMessage);
      setSuccess(response.ok);

      if (response.ok) form.reset();
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
      setSuccess(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="narrow">
      <span className="eyebrow">PEDIDO PERSONALIZADO</span>
      <h1>Faça uma encomenda</h1>
      <p>
        Não encontrou o item? Conte o que procura. A solicitação será salva para
        análise e não garante disponibilidade, prazo ou preço.
      </p>

      <form onSubmit={submit}>
        <label>
          Seu nome
          <input required name="name" autoComplete="name" maxLength={120} />
        </label>

        <label>
          Nick no Roblox
          <input
            required
            name="robloxNick"
            autoComplete="off"
            minLength={3}
            maxLength={80}
          />
        </label>

        <label>
          Contato (WhatsApp, Instagram, TikTok ou e-mail)
          <input
            required
            name="contact"
            autoComplete="email"
            minLength={5}
            maxLength={200}
          />
        </label>

        <label>
          Jogo
          <select required name="game" defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            <option value="mm2">MM2</option>
            <option value="ftf">FTF</option>
            <option value="adopt-me">Adopt Me</option>
            <option value="other">Outro</option>
          </select>
        </label>

        <label>
          O que você procura?
          <textarea required name="request" rows={5} minLength={5} maxLength={2000} />
        </label>

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <label>
            Site
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <button disabled={busy}>{busy ? "Enviando…" : "Enviar solicitação"}</button>

        {message && (
          <div
            className={success ? "success" : "warning"}
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}
      </form>
    </section>
  );
}
