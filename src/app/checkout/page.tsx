"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/catalog-display";
import type { Product } from "@/types";

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

function PixIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3.5l3.3 3.3a2.4 2.4 0 0 0 3.4 0L18 3.5M8 20.5l3.3-3.3a2.4 2.4 0 0 1 3.4 0l3.3 3.3M3.5 16l3.3-3.3a2.4 2.4 0 0 0 0-3.4L3.5 6M20.5 6l-3.3 3.3a2.4 2.4 0 0 0 0 3.4l3.3 3.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Checkout() {
  const { lines, clear } = useCart();
  const attemptId = useRef<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pix, setPix] = useState<PixInfo | null>(null);
  const [pixTotalCents, setPixTotalCents] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.products) setProducts(data.products as Product[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lines.length || busy) return;

    setBusy(true);
    setMessage("Reservando itens e gerando Pix…");
    setPix(null);

    if (!attemptId.current) {
      attemptId.current = crypto.randomUUID();
    }

    const estimatedTotal = lines.reduce((sum, line) => {
      const product = products.find((item) => item.id === line.productId);
      return product ? sum + product.priceCents * line.quantity : sum;
    }, 0);

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
          couponCode: form.get("couponCode") || undefined,
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
        setPixTotalCents(estimatedTotal > 0 ? estimatedTotal : null);
        clear();
        attemptId.current = null;
      }
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function copyPixCode() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setMessage("Não foi possível copiar automaticamente. Selecione o código manualmente.");
    }
  }

  return (
    <section className="narrow">
      <span className="eyebrow">Checkout</span>
      <h1>Finalizar com Pix</h1>

      <div className="checkout-steps" aria-hidden="true">
        <span className="checkout-step is-done">
          <span className="checkout-step__index">✓</span> Carrinho
        </span>
        <span className="checkout-step-sep" />
        <span className={`checkout-step ${pix ? "is-done" : "is-active"}`}>
          <span className="checkout-step__index">{pix ? "✓" : "2"}</span> Dados
        </span>
        <span className="checkout-step-sep" />
        <span className={`checkout-step ${pix ? "is-active" : ""}`}>
          <span className="checkout-step__index">3</span> Pagamento
        </span>
      </div>

      {!pix && (
        <p>
          Ao confirmar, seus itens ficam reservados por um período curto
          enquanto você paga o Pix. A confirmação do pagamento é automática.
        </p>
      )}

      {pix ? (
        <div className="pix-panel">
          <div className="panel">
            <div className="row">
              <h2>
                <PixIcon /> Pague com Pix
              </h2>
            </div>

            {pixTotalCents !== null && (
              <div className="pix-amount">
                <span className="muted">Valor do pedido</span>
                <div className="value price">{money(pixTotalCents)}</div>
              </div>
            )}

            {pix.qrCodeBase64 && (
              <div className="pix-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${pix.qrCodeBase64}`}
                  alt="QR Code para pagamento Pix"
                  width={220}
                  height={220}
                />
              </div>
            )}

            <div className="pix-code-field">
              <label htmlFor="pix-code">Código Pix copia e cola</label>
              <textarea id="pix-code" readOnly value={pix.qrCode} rows={4} />
              <button
                type="button"
                className={`button sm pix-copy-button${copied ? " is-copied" : ""}`}
                onClick={copyPixCode}
                aria-label="Copiar código Pix copia e cola"
              >
                {copied ? (
                  <>
                    <CheckIcon /> Copiado
                  </>
                ) : (
                  <>
                    <CopyIcon /> Copiar
                  </>
                )}
              </button>
            </div>

            <ol className="list" style={{ paddingLeft: 18, marginTop: 4 }}>
              <li>Abra o app do seu banco e escolha pagar com Pix.</li>
              <li>Escaneie o QR Code acima ou cole o código copiado.</li>
              <li>Confirme o pagamento — a aprovação é automática.</li>
            </ol>

            <div className="pix-meta">
              {pix.expiresAt && (
                <span>Expira em: {new Date(pix.expiresAt).toLocaleString("pt-BR")}</span>
              )}
            </div>

            <div className="warning">
              Não feche esta página até concluir o pagamento. A confirmação é
              automática pelo Mercado Pago assim que o Pix for aprovado.
            </div>

            {message && (
              <div className="notice" role="status" aria-live="polite">
                {message}
              </div>
            )}

            <p>
              Depois de pagar, acompanhe a entrega e tire dúvidas no{" "}
              <Link href="/chat">chat com a loja</Link>.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="two-col-form">
            <label className="field-required">
              Nick no Roblox
              <input
                name="robloxNick"
                autoComplete="off"
                required
                minLength={3}
                maxLength={80}
              />
            </label>

            <label className="field-required">
              Contato (WhatsApp, Instagram, TikTok ou e-mail)
              <input
                name="contact"
                autoComplete="email"
                required
                minLength={5}
                maxLength={200}
              />
            </label>

            <label className="field-full">
              Cupom de desconto (opcional)
              <input name="couponCode" autoComplete="off" maxLength={50} />
            </label>
          </div>

          <p className="field-help">
            Seus itens ficam reservados durante o pagamento. Nenhuma quantidade
            interna de estoque é exibida publicamente.
          </p>

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
