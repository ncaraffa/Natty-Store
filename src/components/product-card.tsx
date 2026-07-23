"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { money, publicStock } from "@/lib/catalog-display";
import { useCart } from "./cart-provider";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const purchasable =
    product.stockStatus === "available" || product.stockStatus === "limited";

  return (
    <article className="card">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="product-image" src={product.image} alt={product.name} loading="lazy" />
      ) : (
        <div className="mock-art" aria-hidden="true">
          {product.category.toUpperCase()}
        </div>
      )}
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="row">
        <strong>{money(product.priceCents)}</strong>
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
        <button disabled={!purchasable} onClick={() => add(product.id)}>
          {purchasable ? "Adicionar ao carrinho" : "Indisponível"}
        </button>
      )}
    </article>
  );
}
