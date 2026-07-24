"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product-card";

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EmptySearchIcon() {
  return (
    <svg className="empty-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 19l-4.3-4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Busca() {
  const [products, setProducts] = useState<Product[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    const query = term.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query),
    );
  }, [products, term]);

  return (
    <section>
      <span className="eyebrow">Busca</span>
      <h1>Buscar produtos</h1>
      <p>Encontre itens de MM2, FTF e Adopt Me pelo nome ou pela descrição.</p>

      <div className="search-bar">
        <SearchIcon />
        <input
          type="search"
          placeholder="Digite o nome do item..."
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          autoFocus
          aria-label="Buscar produtos"
        />
      </div>

      {loading ? (
        <div className="notice">Carregando catálogo…</div>
      ) : (
        <>
          {term.trim() && (
            <p className="results-count">
              {results.length} resultado{results.length === 1 ? "" : "s"} para
              &quot;{term}&quot;
            </p>
          )}

          {results.length === 0 ? (
            <div className="empty">
              <EmptySearchIcon />
              <h2>Nenhum item encontrado</h2>
              <p>
                Tente outro termo de busca ou explore o catálogo completo pelo
                menu principal.
              </p>
            </div>
          ) : (
            <div className="grid">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
