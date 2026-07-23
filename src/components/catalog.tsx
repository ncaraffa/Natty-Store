import type { Category } from "@/types";
import { getCatalogProducts } from "@/lib/catalog";
import { ProductCard } from "./product-card";

export async function Catalog({ category }: { category?: Category }) {
  const items = await getCatalogProducts(category);

  if (!items.length) {
    return (
      <div className="empty">
        <h2>Nenhum produto publicado nesta categoria.</h2>
        <p>O catálogo exibirá somente produtos reais cadastrados e ativados.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
