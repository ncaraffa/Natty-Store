"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { badgeLabels } from "@/types";
import { money, publicStock } from "@/lib/catalog-display";
import { useCart } from "./cart-provider";

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2L12 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 7.2L12 11l8-3.8M12 11v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Anima uma "bolha" curta do botão até o ícone do carrinho no
 * cabeçalho, usando a Web Animations API (sem depender de estado do
 * React). Some sozinha ao fim; nada é adicionado se o alvo não
 * existir ainda (ex.: cabeçalho não montado) ou com movimento
 * reduzido ativado.
 */
function flyToCart(originEl: HTMLElement) {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target = document.getElementById("header-cart-icon");
  if (!target) return;

  const originRect = originEl.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const originX = originRect.left + originRect.width / 2;
  const originY = originRect.top + originRect.height / 2;
  const dx = targetRect.left + targetRect.width / 2 - originX;
  const dy = targetRect.top + targetRect.height / 2 - originY;

  const ghost = document.createElement("span");
  ghost.className = "fly-to-cart-ghost";
  ghost.style.left = `${originX}px`;
  ghost.style.top = `${originY}px`;
  document.body.appendChild(ghost);

  const animation = ghost.animate(
    [
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0 },
      {
        transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 70}px)) scale(0.8)`,
        opacity: 1,
        offset: 0.6,
      },
      {
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.25)`,
        opacity: 0,
        offset: 1,
      },
    ],
    { duration: 640, easing: "cubic-bezier(0.22, 0.7, 0.32, 1)" },
  );

  const cleanup = () => ghost.remove();
  animation.onfinish = cleanup;
  animation.oncancel = cleanup;
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const canTiltRef = useRef(false);
  const purchasable =
    product.stockStatus === "available" || product.stockStatus === "limited";

  useEffect(() => {
    canTiltRef.current =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!canTiltRef.current) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-x", `${(-py * 7).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(px * 9).toFixed(2)}deg`);
  }

  function handlePointerLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  }

  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    add(product.id);
    flyToCart(event.currentTarget);
    setJustAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setJustAdded(false), 1100);
  }

  return (
    <article
      ref={cardRef}
      className={`card${product.badge ? ` card-accent-${product.badge}` : ""}`}
      data-reveal="pop"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {product.badge && (
        <span className={`badge badge-${product.badge}`}>{badgeLabels[product.badge]}</span>
      )}
      <div className="product-image-frame">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="product-image" src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <div className="mock-art" aria-hidden="true">
            <BoxIcon />
            {product.category.toUpperCase()}
          </div>
        )}
      </div>
      <span className="card-eyebrow">{product.category}</span>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="row">
        <strong className="price">{money(product.priceCents)}</strong>
        <span className={`stock status-${product.stockStatus}`}>
          {publicStock[product.stockStatus]}
        </span>
      </div>
      {product.stockStatus === "preorder" ||
      product.stockStatus === "backorder" ? (
        <Link className="button card-action" href="/encomendas">
          Solicitar encomenda
        </Link>
      ) : (
        <button
          className={`card-action${justAdded ? " is-added" : ""}`}
          disabled={!purchasable}
          onClick={handleAdd}
        >
          {justAdded ? (
            <>
              <CheckIcon /> Adicionado
            </>
          ) : purchasable ? (
            "Adicionar ao carrinho"
          ) : (
            "Indisponível"
          )}
        </button>
      )}
    </article>
  );
}
