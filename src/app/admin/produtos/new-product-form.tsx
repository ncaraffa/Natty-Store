"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProduct, type ProductFormState } from "./actions";
import { badgeOptions } from "./shared";

export function NewProductForm() {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    createProduct,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="admin-new-form" encType="multipart/form-data">
      <label>
        Nome
        <input required name="name" maxLength={120} />
      </label>
      <label>
        Categoria
        <select required name="category" defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          <option value="mm2">MM2</option>
          <option value="ftf">FTF</option>
          <option value="adopt-me">Adopt Me</option>
        </select>
      </label>
      <label>
        Preço (R$)
        <input required name="price" inputMode="decimal" placeholder="1,99" />
      </label>
      <label>
        Imagem (arquivo)
        <input name="image_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      </label>
      <label>
        Imagem (URL, opcional se enviar arquivo)
        <input name="image_url" placeholder="https://..." />
      </label>
      <label>
        Selo
        <select name="badge" defaultValue="">
          {badgeOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label style={{ gridColumn: "1 / -1" }}>
        Descrição
        <textarea name="description" rows={2} maxLength={2000} />
      </label>
      <div style={{ gridColumn: "1 / -1" }} className="form-actions">
        <button disabled={pending}>{pending ? "Criando…" : "Criar produto"}</button>
      </div>
      {state?.error && (
        <div className="warning" style={{ gridColumn: "1 / -1" }} role="status" aria-live="polite">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="success" style={{ gridColumn: "1 / -1" }} role="status" aria-live="polite">
          {state.success}
        </div>
      )}
    </form>
  );
}
