"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { badgeLabels } from "@/types";
import { money, publicStock } from "@/lib/catalog-display";
import { useCart } from "./cart-provider";

const categoryLabels: Record<Product["category"], string> = {
  mm2: "MM2",
  ftf: "Flee the Facility",
  "adopt-me": "Adopt Me",
};

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

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const purchasable =
    product.stockStatus === "available" || product.stockStatus === "limited";
  const byRequest =
    product.stockStatus === "preorder" || product.stockStatus === "backorder";

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function handleAdd() {
    add(product.id);
    setJustAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setJustAdded(false), 1100);
  }

  return (
    <article className="card" data-reveal>
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

      <div className="card-body">
        <span className="card-eyebrow">{categoryLabels[product.category]}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
      </div>

      <div className="card-footer">
        <div className="card-price">
          <strong className="price">{money(product.priceCents)}</strong>
          <span className={`stock status-${product.stockStatus}`}>
            {publicStock[product.stockStatus]}
          </span>
        </div>

        {byRequest ? (
          <Link className="button sm card-action card-order-link" href="/encomendas">
            Encomendar
          </Link>
        ) : (
          <button
            type="button"
            className={`card-action card-add${justAdded ? " is-added" : ""}`}
            disabled={!purchasable}
            onClick={handleAdd}
            aria-label={
              purchasable
                ? `Adicionar ${product.name} ao carrinho`
                : `${product.name} indisponível`
            }
            title={purchasable ? "Adicionar ao carrinho" : "Indisponível"}
          >
            {justAdded ? <CheckIcon /> : purchasable ? <PlusIcon /> : <CrossIcon />}
          </button>
        )}
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {justAdded ? `${product.name} adicionado ao carrinho` : ""}
      </span>
    </article>
  );
}
