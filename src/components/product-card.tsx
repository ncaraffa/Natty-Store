"use client";

import { useEffect, useRef, useState } from "react";
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

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const purchasable =
    product.stockStatus === "available" || product.stockStatus === "limited";

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
    <article
      className={`card${product.badge ? ` card-accent-${product.badge}` : ""}`}
      data-reveal
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
