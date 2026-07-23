"use client";

import { FormEvent, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";

type PixInfo = {
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string | null;
};

type CheckoutResponse = {
  message?: string;
  pix?: PixInfo;
  order?: { reservationExpiresAt: string | null };
};

export default function Checkout() {
  const { lines, clear } = useCart();
  const attemptId = useRef<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pix, setPix] = useState<PixInfo | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lines.length || busy) return;

    setBusy(true);
    setMessage("Reservando itens e gerando Pix…");
    setPix(null);

    if (!attemptId.current) {
      attemptId.current = crypto.randomUUID();
    }

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          attemptId: attemptId.current,
          robloxNick: form.get("robloxNick"),
          contact: form.get("contact"),
          items: lines,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | CheckoutResponse
        | null;

      setMessage(
        data?.message ??
          (response.ok
            ? "Reserva criada."
            : "Não foi possível continuar."),
      );

      if (response.ok && data?.pix) {
        setPix(data.pix);
        clear();
        attemptId.current = null;
      }
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="narrow">
      <span className="eyebrow">CHECKOUT</span>
      <h1>Finalizar com Pix</h1>
      <p>
        Ao confirmar, seus itens ficam reservados por um período curto enquanto
        você paga o Pix. A confirmação do pagamento é automática.
      </p>

      {pix ? (
        <div className="panel">
          <h2>Pague com Pix</h2>
          {pix.qrCodeBase64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${pix.qrCodeBase64}`}
              alt="QR Code Pix"
              width={240}
              height={240}
            />
          )}
          <label>
            Código copia e cola
            <textarea readOnly value={pix.qrCode} rows={4} />
          </label>
          {pix.expiresAt && (
            <p className="muted">
              Expira em: {new Date(pix.expiresAt).toLocaleString("pt-BR")}
            </p>
          )}
          {message && (
            <div className="notice" role="status" aria-live="polite">
              {message}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit}>
          <label>
            Nick no Roblox *
            <input
              name="robloxNick"
              autoComplete="off"
              required
              minLength={3}
              maxLength={80}
            />
          </label>

          <label>
            Contato (WhatsApp, Instagram, TikTok ou e-mail) *
            <input
              name="contact"
              autoComplete="email"
              required
              minLength={5}
              maxLength={200}
            />
          </label>

          <button disabled={!lines.length || busy}>
            {busy ? "Gerando Pix…" : "Gerar Pix"}
          </button>

          {!lines.length && (
            <p className="warning">
              Adicione ao menos um item ao carrinho para continuar.
            </p>
          )}

          {message && (
            <div className="notice" role="status" aria-live="polite">
              {message}
            </div>
          )}
        </form>
      )}
    </section>
  );
}
