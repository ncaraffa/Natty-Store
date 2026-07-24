import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import { InventoryRowForm } from "./inventory-row-form";

export const dynamic = "force-dynamic";

type InventoryRow = {
  product_id: string;
  on_hand: number;
  reserved: number;
  public_status: string;
  sell_policy: string;
  products: { name: string; category: string } | null;
};

function rowStatusClass(available: number) {
  if (available <= 0) return "admin-row-critical";
  if (available <= 3) return "admin-row-low";
  return "";
}

function availabilityNote(available: number) {
  if (available <= 0) return "Esgotado";
  if (available <= 3) return "Estoque baixo";
  return "";
}

export default async function AdminInventory() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("inventory")
    .select("product_id,on_hand,reserved,public_status,sell_policy,products(name,category)")
    .order("product_id");

  const rows = (data ?? []) as unknown as InventoryRow[];

  return (
    <AdminShell activeKey="estoque">
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
              {rows.map((row) => {
                const available = row.on_hand - row.reserved;
                const note = availabilityNote(available);
                return (
                  <tr key={row.product_id} className={rowStatusClass(available)}>
                    <td>
                      <div className="admin-stock-cell">
                        <span>{row.products?.name ?? row.product_id}</span>
                        {note && (
                          <span className="admin-stock-note">
                            <span className={`badge ${available <= 0 ? "badge-danger" : "badge-warning"}`}>{note}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td colSpan={5} style={{ padding: 0 }}>
                      <InventoryRowForm row={row} />
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="admin-table-empty">
                    Nenhum item de estoque encontrado.
                  </td>
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
    </AdminShell>
  );
}
