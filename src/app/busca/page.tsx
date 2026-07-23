"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product-card";

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
      <span className="eyebrow">BUSCA</span>
      <h1>Buscar produtos</h1>
      <input
        type="search"
        placeholder="Digite o nome do item..."
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        autoFocus
      />

      {loading ? (
        <div className="notice">Carregando catálogo…</div>
      ) : results.length === 0 ? (
        <div className="empty">Nenhum item encontrado para &quot;{term}&quot;.</div>
      ) : (
        <div className="grid">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
