"use client";

import { useActionState } from "react";
import { updateProduct, type ProductFormState } from "./actions";
import { badgeOptions, toReais, type ProductRow } from "./shared";

export function ProductRowForm({ product }: { product: ProductRow }) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    updateProduct,
    null,
  );

  return (
    <form action={formAction} className="admin-row-form" encType="multipart/form-data">
      <input type="hidden" name="id" value={product.id} />
      <div>
        <div className="admin-cell">
          <span className="admin-cell-label">Nome</span>
          <input name="name" defaultValue={product.name} maxLength={120} required />
        </div>
        <div className="admin-cell">
          <span className="admin-cell-label">Categoria</span>
          <select name="category" defaultValue={product.category}>
            <option value="mm2">MM2</option>
            <option value="ftf">FTF</option>
            <option value="adopt-me">Adopt Me</option>
          </select>
        </div>
        <div className="admin-cell">
          <span className="admin-cell-label">Preço (R$)</span>
          <input name="price" defaultValue={toReais(product.price_cents)} inputMode="decimal" />
        </div>
        <div className="admin-cell">
          <span className="admin-cell-label">Imagem</span>
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt="" className="admin-cell-thumb" />
          )}
          <input
            name="image_file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ maxWidth: 160 }}
          />
          <input
            name="image_url"
            defaultValue={product.image_url ?? ""}
            placeholder="ou cole uma URL"
            style={{ marginTop: 4 }}
          />
        </div>
        <div className="admin-cell">
          <span className="admin-cell-label">Descrição</span>
          <textarea
            name="description"
            defaultValue={product.description}
            rows={2}
            maxLength={2000}
            style={{ minWidth: "180px" }}
          />
        </div>
        <div className="admin-cell">
          <span className="admin-cell-label">Selo</span>
          <select name="badge" defaultValue={product.badge ?? ""}>
            {badgeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-cell">
          <span className="admin-cell-label">Ativo</span>
          <input type="checkbox" name="active" defaultChecked={product.active} aria-label="Produto ativo" />
        </div>
        <div className="admin-cell admin-cell-slug">
          <span className="admin-cell-label">Slug</span>
          {product.slug}
        </div>
        <div className="admin-cell">
          <span className="admin-cell-label">&nbsp;</span>
          <button disabled={pending}>{pending ? "Salvando…" : "Salvar"}</button>
        </div>
      </div>
      {state?.error && (
        <div className="warning" role="status" aria-live="polite" style={{ margin: "8px 12px" }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="success" role="status" aria-live="polite" style={{ margin: "8px 12px" }}>
          {state.success}
        </div>
      )}
    </form>
  );
}
