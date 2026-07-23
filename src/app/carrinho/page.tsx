"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/catalog-display";
import type { Product } from "@/types";

type CatalogResponse = { products?: Product[] };

export default function Cart() {
  const { lines, setQuantity, remove } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" });
        if (!response.ok) throw new Error("catalog request failed");
        const data = (await response.json()) as CatalogResponse;
        if (!cancelled) setProducts(Array.isArray(data.products) ? data.products : []);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const detailed = useMemo(
    () =>
      lines.flatMap((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product ? [{ ...line, product }] : [];
      }),
    [lines, products],
  );

  const missing = useMemo(
    () => lines.filter((line) => !products.some((item) => item.id === line.productId)),
    [lines, products],
  );

  const total = detailed.reduce(
    (sum, item) => sum + item.quantity * item.product.priceCents,
    0,
  );

  return (
    <section>
      <span className="eyebrow">SEU PEDIDO</span>
      <h1>Carrinho</h1>

      {loading ? (
        <div className="notice">Carregando catálogo…</div>
      ) : loadError ? (
        <div className="warning">Não foi possível carregar o catálogo.</div>
      ) : !lines.length ? (
        <div className="empty">
          <h2>Seu carrinho está vazio</h2>
          <Link className="button" href="/">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="list">
            {detailed.map((item) => (
              <article className="cart-line" key={item.productId}>
                <div>
                  <h3>{item.product.name}</h3>
                  <span>{money(item.product.priceCents)}</span>
                </div>
                <label>
                  Quantidade
                  <input
                    aria-label={`Quantidade de ${item.product.name}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="99"
                    value={item.quantity}
                    onChange={(event) =>
                      setQuantity(item.productId, Number(event.target.value))
                    }
                  />
                </label>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => remove(item.productId)}
                >
                  Remover
                </button>
              </article>
            ))}

            {missing.map((line) => (
              <article className="cart-line" key={line.productId}>
                <div>
                  <h3>Item indisponível ou removido do catálogo</h3>
                  <p>Esse item não será enviado ao checkout.</p>
                </div>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => remove(line.productId)}
                >
                  Remover
                </button>
              </article>
            ))}
          </div>

          <aside className="summary">
            <h2>Resumo</h2>
            <div className="row">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <p>
              O site mostra apenas o status público. Quantidades internas de estoque
              permanecem protegidas.
            </p>
            {detailed.length > 0 && missing.length === 0 ? (
              <Link className="button" href="/checkout">
                Continuar
              </Link>
            ) : (
              <p className="warning">Remova os itens indisponíveis para continuar.</p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
