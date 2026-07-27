"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/catalog-display";
import type { Product } from "@/types";

type CatalogResponse = { products?: Product[] };

function BagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l1.2 12.2a1.5 1.5 0 0 1-1.5 1.8H6.3a1.5 1.5 0 0 1-1.5-1.8L6 8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

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
      <span className="eyebrow">Seu pedido</span>
      <h1>Carrinho</h1>

      {loading ? (
        <div className="notice">Carregando catálogo…</div>
      ) : loadError ? (
        <div className="warning">Não foi possível carregar o catálogo.</div>
      ) : !lines.length ? (
        <div className="empty">
          <BagIcon className="empty-glyph" />
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione itens do catálogo para começar sua compra.</p>
          <Link className="button" href="/">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="list">
            {detailed.map((item, index) => (
              <article
                className="cart-line"
                key={item.productId}
                style={{ "--i": index } as React.CSSProperties}
              >
                <div className="cart-line-main">
                  <div className="cart-line-media" aria-hidden="true">
                    {item.product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.image} alt="" />
                    ) : (
                      <BagIcon />
                    )}
                  </div>
                  <div className="cart-line-info">
                    <h3>{item.product.name}</h3>
                    <span className="price">{money(item.product.priceCents)}</span>
                  </div>
                </div>

                <div className="cart-line-side">
                  <div className="qty-field">
                    <label htmlFor={`qty-${item.productId}`}>Quantidade</label>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="button sm ghost"
                        aria-label={`Diminuir quantidade de ${item.product.name}`}
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        id={`qty-${item.productId}`}
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
                      <button
                        type="button"
                        className="button sm ghost"
                        aria-label={`Aumentar quantidade de ${item.product.name}`}
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <span className="line-subtotal price">
                    {money(item.quantity * item.product.priceCents)}
                  </span>

                  <button
                    type="button"
                    className="link-button"
                    onClick={() => remove(item.productId)}
                  >
                    Remover
                  </button>
                </div>
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
            <div className="summary-row total">
              <span>Total</span>
              <strong className="price">{money(total)}</strong>
            </div>
            <p>
              O site mostra apenas o status público. Quantidades internas de
              estoque permanecem protegidas.
            </p>
            {detailed.length > 0 && missing.length === 0 ? (
              <Link className="button block" href="/checkout">
                Continuar para o checkout
              </Link>
            ) : (
              <p className="warning">Remova os itens indisponíveis para continuar.</p>
            )}
            <Link className="button ghost block" href="/">
              Continuar comprando
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
