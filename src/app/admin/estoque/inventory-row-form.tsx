"use client";

import { useActionState } from "react";
import { updateInventory, type InventoryFormState } from "./actions";

type InventoryRow = {
  product_id: string;
  on_hand: number;
  reserved: number;
  public_status: string;
  sell_policy: string;
};

export function InventoryRowForm({ row }: { row: InventoryRow }) {
  const [state, formAction, pending] = useActionState<InventoryFormState, FormData>(
    updateInventory,
    null,
  );

  return (
    <div>
      <form
        action={formAction}
        style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "12px 14px" }}
      >
        <input type="hidden" name="product_id" value={row.product_id} />
        <label className="sr-only" htmlFor={`on_hand_${row.product_id}`}>
          Em mãos
        </label>
        <input
          id={`on_hand_${row.product_id}`}
          type="number"
          name="on_hand"
          min={0}
          defaultValue={row.on_hand}
          style={{ width: 76 }}
        />
        <span className="admin-stock-note">reservado: {row.reserved}</span>
        <select name="sell_policy" defaultValue={row.sell_policy} aria-label="Política de venda">
          <option value="in_stock">Em estoque</option>
          <option value="preorder">Pré-venda</option>
          <option value="backorder">Sob encomenda</option>
          <option value="disabled">Desativado</option>
        </select>
        <select name="public_status" defaultValue={row.public_status} aria-label="Status público">
          <option value="available">Disponível</option>
          <option value="limited">Limitado</option>
          <option value="unavailable">Indisponível</option>
          <option value="preorder">Pré-venda</option>
          <option value="backorder">Sob encomenda</option>
        </select>
        <button disabled={pending}>{pending ? "Salvando…" : "Salvar"}</button>
      </form>
      {state?.error && (
        <div className="warning" role="status" aria-live="polite" style={{ margin: "0 14px 12px" }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="success" role="status" aria-live="polite" style={{ margin: "0 14px 12px" }}>
          {state.success}
        </div>
      )}
    </div>
  );
}
