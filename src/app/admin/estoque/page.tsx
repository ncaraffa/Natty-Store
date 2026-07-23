import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { updateInventory } from "./actions";

export const dynamic = "force-dynamic";

type InventoryRow = {
  product_id: string;
  on_hand: number;
  reserved: number;
  public_status: string;
  sell_policy: string;
  products: { name: string; category: string } | null;
};

export default async function AdminInventory() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("inventory")
    .select("product_id,on_hand,reserved,public_status,sell_policy,products(name,category)")
    .order("product_id");

  const rows = (data ?? []) as unknown as InventoryRow[];

  return (
    <section>
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">ADMINISTRAÇÃO</span>
          <h1>Estoque</h1>
        </div>
        <Link href="/admin" className="button ghost">
          Voltar
        </Link>
      </div>

      {error && <div className="warning">Falha ao carregar estoque: {error.message}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Em mãos</th>
              <th>Reservado</th>
              <th>Política</th>
              <th>Status público</th>
              <th>Salvar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.product_id}>
                <td>{row.products?.name ?? row.product_id}</td>
                <td colSpan={5} style={{ padding: 0 }}>
                  <form
                    action={updateInventory}
                    style={{ display: "flex", gap: 6, alignItems: "center", padding: "10px 12px" }}
                  >
                    <input type="hidden" name="product_id" value={row.product_id} />
                    <input
                      type="number"
                      name="on_hand"
                      min={0}
                      defaultValue={row.on_hand}
                      style={{ width: 70 }}
                    />
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>reservado: {row.reserved}</span>
                    <select name="sell_policy" defaultValue={row.sell_policy}>
                      <option value="in_stock">Em estoque</option>
                      <option value="preorder">Pré-venda</option>
                      <option value="backorder">Sob encomenda</option>
                      <option value="disabled">Desativado</option>
                    </select>
                    <select name="public_status" defaultValue={row.public_status}>
                      <option value="available">Disponível</option>
                      <option value="limited">Limitado</option>
                      <option value="unavailable">Indisponível</option>
                      <option value="preorder">Pré-venda</option>
                      <option value="backorder">Sob encomenda</option>
                    </select>
                    <button>Salvar</button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !error && (
              <tr>
                <td colSpan={6}>Nenhum item de estoque encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="muted">
        Regras do banco: <b>em estoque</b> aceita disponível/limitado/indisponível; <b>pré-venda</b> exige status
        pré-venda; <b>sob encomenda</b> exige status sob encomenda; <b>desativado</b> exige status indisponível.
      </p>
    </section>
  );
}
