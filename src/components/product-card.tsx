"use client";

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

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const purchasable =
    product.stockStatus === "available" || product.stockStatus === "limited";

  return (
    <article className="card">
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
          className="card-action"
          disabled={!purchasable}
          onClick={() => add(product.id)}
        >
          {purchasable ? "Adicionar ao carrinho" : "Indisponível"}
        </button>
      )}
    </article>
  );
}
