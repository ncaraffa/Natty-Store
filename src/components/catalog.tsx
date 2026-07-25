import type { Category } from "@/types";
import { getCatalogProducts } from "@/lib/catalog";
import { ProductCard } from "./product-card";

function EmptyBoxIcon() {
  return (
    <svg className="empty-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2L12 3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M4 7.2L12 11l8-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export async function Catalog({ category }: { category?: Category }) {
  const items = await getCatalogProducts(category);

  if (!items.length) {
    return (
      <div className="empty">
        <EmptyBoxIcon />
        <h2>Nenhum produto publicado nesta categoria.</h2>
        <p>O catálogo exibirá somente produtos reais cadastrados e ativados.</p>
      </div>
    );
  }

  return (
    <div className="grid" data-reveal-group>
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
