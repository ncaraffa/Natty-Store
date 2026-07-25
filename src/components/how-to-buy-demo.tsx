"use client";

import { useEffect, useState } from "react";

type SceneId = "produto" | "carrinho" | "checkout" | "sucesso";

const SCENES: { id: SceneId; label: string; duration: number; url: string }[] = [
  { id: "produto", label: "Abrir o produto", duration: 4200, url: "nattystore.com/mm2/katana-fantasma" },
  { id: "carrinho", label: "Adicionar ao carrinho", duration: 3800, url: "nattystore.com/carrinho" },
  { id: "checkout", label: "Pagar com Pix", duration: 4600, url: "nattystore.com/checkout" },
  { id: "sucesso", label: "Compra confirmada", duration: 3400, url: "nattystore.com/minhas-compras" },
];

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4.5v15l13-7.5-13-7.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="5.5" y="4.5" width="4.5" height="15" rx="1" />
      <rect x="14" y="4.5" width="4.5" height="15" rx="1" />
    </svg>
  );
}

function Cursor({ left, top, clicking }: { left: string; top: string; clicking: boolean }) {
  return (
    <span className={`tour-cursor${clicking ? " is-clicking" : ""}`} style={{ left, top }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 2.4l15.2 7.1-6.1 1.9-2.3 6-6.8-15z" />
      </svg>
    </span>
  );
}

function BoxGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 7.2L12 11l8-3.8M12 11v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CartGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L20 8H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="21" r="1.4" fill="currentColor" />
      <circle cx="17" cy="21" r="1.4" fill="currentColor" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Cada cena controla seu próprio "gesto" (cursor -> clique -> reação),
   com timers curtos que rodam uma vez ao montar. A troca de cena inteira
   acontece no componente pai (key={step}), então essas fases sempre
   recomeçam do zero quando a cena volta a ficar ativa. */
function ProductScene({ motion }: { motion: boolean }) {
  const [phase, setPhase] = useState<"idle" | "clicking" | "added">(motion ? "idle" : "added");

  useEffect(() => {
    if (!motion) return;
    const toClick = setTimeout(() => setPhase("clicking"), 1200);
    const toAdded = setTimeout(() => setPhase("added"), 1550);
    return () => {
      clearTimeout(toClick);
      clearTimeout(toAdded);
    };
  }, [motion]);

  const added = phase === "added";

  return (
    <div className="tour-stage">
      <div className="tour-mini-header">
        <span className="tour-mini-brand">Natty Store</span>
        <span className={`tour-mini-cart${added ? " is-bumping" : ""}`}>
          <CartGlyph />
          {added && <span className="tour-mini-cart-count">1</span>}
        </span>
      </div>
      <div className="tour-mock-card">
        <span className="badge badge-featured">Destaque</span>
        <div className="tour-mock-image">
          <BoxGlyph />
        </div>
        <span className="card-eyebrow">MM2</span>
        <h4>Katana Fantasma</h4>
        <div className="row tour-mock-row">
          <strong className="price">R$ 24,90</strong>
          <span className="stock status-available">Em estoque</span>
        </div>
        <span className={`tour-mock-button${added ? " is-added" : ""}`}>
          {added ? (
            <>
              <CheckGlyph /> Adicionado
            </>
          ) : (
            "Adicionar ao carrinho"
          )}
        </span>
      </div>
      {motion && (
        <Cursor
          left={phase === "idle" ? "58%" : "76%"}
          top={phase === "idle" ? "38%" : "83%"}
          clicking={phase === "clicking"}
        />
      )}
    </div>
  );
}

function CartScene({ motion }: { motion: boolean }) {
  const [phase, setPhase] = useState<"idle" | "qty" | "toButton" | "clicking" | "done">(
    motion ? "idle" : "done",
  );

  useEffect(() => {
    if (!motion) return;
    const t1 = setTimeout(() => setPhase("qty"), 700);
    const t2 = setTimeout(() => setPhase("toButton"), 1500);
    const t3 = setTimeout(() => setPhase("clicking"), 2300);
    const t4 = setTimeout(() => setPhase("done"), 2650);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [motion]);

  const qty = phase === "idle" ? 1 : 2;
  const subtotal = qty === 1 ? "R$ 24,90" : "R$ 49,80";
  const cursorAtButton = phase === "toButton" || phase === "clicking" || phase === "done";

  return (
    <div className="tour-stage">
      <div className="tour-mini-header">
        <span className="tour-mini-brand">Natty Store</span>
        <span className="tour-mini-cart">
          <CartGlyph />
          <span className="tour-mini-cart-count">{qty}</span>
        </span>
      </div>
      <div className="tour-cart-line">
        <div className="tour-cart-line-main">
          <div className="cart-line-media" aria-hidden="true">
            <BoxGlyph />
          </div>
          <div>
            <h4>Katana Fantasma</h4>
            <span className="stock status-available">Em estoque</span>
          </div>
        </div>
        <div className="tour-qty-stepper">
          <span className={`tour-qty-btn${phase === "qty" ? " is-pressed" : ""}`}>+</span>
          <span className="tour-qty-value">{qty}</span>
          <span className="tour-qty-btn">-</span>
        </div>
      </div>
      <div className="tour-cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{subtotal}</span>
        </div>
        <span className={`tour-mock-button block${phase === "done" ? " is-added" : ""}`}>
          {phase === "done" ? "Indo para o checkout…" : "Finalizar compra"}
        </span>
      </div>
      {motion && (
        <Cursor
          left={cursorAtButton ? "50%" : "80%"}
          top={cursorAtButton ? "88%" : "46%"}
          clicking={phase === "clicking"}
        />
      )}
    </div>
  );
}

function CheckoutScene({ motion }: { motion: boolean }) {
  const [phase, setPhase] = useState<"idle" | "clicking" | "copied" | "confirmed">(
    motion ? "idle" : "confirmed",
  );

  useEffect(() => {
    if (!motion) return;
    const t1 = setTimeout(() => setPhase("clicking"), 900);
    const t2 = setTimeout(() => setPhase("copied"), 1250);
    const t3 = setTimeout(() => setPhase("confirmed"), 3000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [motion]);

  const paid = phase === "confirmed";

  return (
    <div className="tour-stage tour-stage--checkout">
      <div className="checkout-steps tour-checkout-steps" aria-hidden="true">
        <span className="checkout-step is-done">
          <span className="checkout-step__index">
            <CheckGlyph />
          </span>
          Carrinho
        </span>
        <span className="checkout-step-sep" />
        <span className={`checkout-step${paid ? " is-done" : " is-active"}`}>
          <span className="checkout-step__index">{paid ? <CheckGlyph /> : "2"}</span>
          Pagamento
        </span>
        <span className="checkout-step-sep" />
        <span className={`checkout-step${paid ? " is-active" : ""}`}>
          <span className="checkout-step__index">3</span>
          Confirmação
        </span>
      </div>

      <div className="tour-pix-frame">
        <div className="tour-qr" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="pix-amount">
          <span className="value">R$ 49,80</span>
        </div>
        <span className={`pix-copy-button${phase === "copied" || paid ? " is-copied" : ""}`}>
          {phase === "copied" || paid ? "Código copiado!" : "Copiar código Pix"}
        </span>
        <p className={`tour-pix-status${paid ? " is-confirmed" : ""}`}>
          <span className="tour-pix-status-dot" aria-hidden="true" />
          {paid ? "Pagamento confirmado" : "Aguardando pagamento…"}
        </p>
      </div>

      {motion && <Cursor left="68%" top="40%" clicking={phase === "clicking"} />}
    </div>
  );
}

function SuccessScene({ motion }: { motion: boolean }) {
  return (
    <div className={`tour-stage tour-stage--success${motion ? " is-animated" : ""}`}>
      {motion && (
        <>
          <span className="tour-sparkle" style={{ top: "10%", left: "18%", animationDelay: "0.1s" }} />
          <span className="tour-sparkle" style={{ top: "22%", right: "14%", animationDelay: "0.6s" }} />
          <span className="tour-sparkle" style={{ bottom: "18%", left: "26%", animationDelay: "1.1s" }} />
        </>
      )}
      <div className="tour-success-badge" aria-hidden="true">
        <CheckGlyph />
      </div>
      <h4>Pedido confirmado!</h4>
      <p>Katana Fantasma × 2 — R$ 49,80 · Pago via Pix</p>
      <span className="tour-mock-button ghost">Ver minhas compras</span>
    </div>
  );
}

export function HowToBuyDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    if (query.matches) setPlaying(false);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  function goToStep(index: number) {
    setStep(index);
    if (!reducedMotion) setPlaying(true);
  }

  const active = SCENES[step];
  const motion = !reducedMotion;

  return (
    <section aria-labelledby="how-to-buy-heading" className="how-to-buy">
      <div className="section-head" data-reveal>
        <div>
          <span className="eyebrow">Passo a passo</span>
          <h2 id="how-to-buy-heading">Como comprar na Natty Store</h2>
          <p>
            Um preview animado do fluxo real da loja — sem vídeo, é a própria interface da
            Natty Store em miniatura. Assista ou avance manualmente.
          </p>
        </div>
      </div>

      <div className="tour" data-reveal>
        <div className="tour-frame">
          <div className="tour-chrome" aria-hidden="true">
            <span className="tour-chrome-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="tour-url">{active.url}</span>
          </div>

          <div className="tour-screen" aria-hidden="true">
            <div key={step} className="tour-scene-enter">
              {active.id === "produto" && <ProductScene motion={motion} />}
              {active.id === "carrinho" && <CartScene motion={motion} />}
              {active.id === "checkout" && <CheckoutScene motion={motion} />}
              {active.id === "sucesso" && <SuccessScene motion={motion} />}
            </div>
          </div>

          <p className="sr-only">
            Demonstração animada e ilustrativa do fluxo de compra da Natty Store, sem áudio:
            primeiro o cliente abre um produto e adiciona ao carrinho; depois ajusta a
            quantidade e segue para o checkout; em seguida paga com Pix e copia o código;
            por fim recebe a confirmação da compra.
          </p>
        </div>

        <div className="tour-player">
          <button
            type="button"
            className="tour-play"
            aria-pressed={playing}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
            <span className="sr-only">
              {playing ? "Pausar demonstração animada" : "Continuar demonstração animada"}
            </span>
          </button>

          <ol className="tour-track-list">
            {SCENES.map((scene, index) => (
              <li key={scene.id}>
                <button
                  type="button"
                  className={`tour-track${index === step ? " is-active" : ""}`}
                  aria-current={index === step ? "step" : undefined}
                  onClick={() => goToStep(index)}
                >
                  <span className="tour-track-bar">
                    {index < step && <span className="tour-track-fill is-complete" />}
                    {index === step && (
                      <span
                        key={`${step}-fill`}
                        className="tour-track-fill"
                        style={{
                          animationDuration: `${scene.duration}ms`,
                          animationPlayState: playing && !reducedMotion ? "running" : "paused",
                        }}
                        onAnimationEnd={() => setStep((current) => (current + 1) % SCENES.length)}
                      />
                    )}
                  </span>
                  <span className="tour-track-label">{scene.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
