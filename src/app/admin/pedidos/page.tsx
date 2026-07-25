import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import { updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  guest_name?: string | null;
  guest_roblox_nick: string;
  guest_contact: string;
  status: string;
  payment_status: string;
  total_cents: number;
  created_at: string;
  order_items: { product_name_snapshot: string; quantity: number; unit_price_cents: number }[];
};

function toReais(cents: number) {
  return (cents / 100).toFixed(2);
}

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  stock_reserved: "Estoque reservado",
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  delivering: "Em entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
  expired: "Expirado",
  refunded: "Reembolsado",
};

const statusBadgeClass: Record<string, string> = {
  draft: "badge-neutral",
  stock_reserved: "badge-warning",
  pending_payment: "badge-warning",
  paid: "badge-success",
  delivering: "badge-info",
  completed: "badge-success",
  cancelled: "badge-danger",
  expired: "badge-danger",
  refunded: "badge-danger",
};

const paymentStatusLabels: Record<string, string> = {
  not_started: "Não iniciado",
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  refunded: "Reembolsado",
};

const paymentBadgeClass: Record<string, string> = {
  not_started: "badge-neutral",
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-danger",
  refunded: "badge-danger",
};

export default async function AdminOrders() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("orders")
    .select(
      "*,order_items(product_name_snapshot,quantity,unit_price_cents)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (data ?? []) as unknown as OrderRow[];

  return (
    <AdminShell activeKey="pedidos">
      <section>
        <div className="admin-toolbar">
          <div>
            <span className="eyebrow">ADMINISTRAÇÃO</span>
            <h1>Pedidos</h1>
          </div>
          <Link href="/admin" className="button ghost">
            Voltar
          </Link>
        </div>

        {error && <div className="warning">Falha ao carregar pedidos: {error.message}</div>}

        <div className="list">
          {orders.map((order) => (
            <div key={order.id} className="cart-line admin-entity-card">
              <div className="admin-entity-head">
                <div>
                  <h3>{order.guest_roblox_nick}</h3>
                  <div className="admin-entity-meta">Nome: {order.guest_name || "—"}</div>
                  <div className="admin-entity-meta">{order.guest_contact}</div>
                  <div className="admin-entity-meta">{new Date(order.created_at).toLocaleString("pt-BR")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="admin-badge-row" style={{ justifyContent: "flex-end" }}>
                    <span className={`badge ${statusBadgeClass[order.status] ?? "badge-neutral"}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                    <span className={`badge ${paymentBadgeClass[order.payment_status] ?? "badge-neutral"}`}>
                      pagamento: {paymentStatusLabels[order.payment_status] ?? order.payment_status}
                    </span>
                  </div>
                  <div className="admin-entity-total">R$ {toReais(order.total_cents)}</div>
                </div>
              </div>

              <ul className="admin-entity-items">
                {order.order_items.map((item, index) => (
                  <li key={index}>
                    <span>
                      {item.quantity}x {item.product_name_snapshot}
                    </span>
                    <span>R$ {toReais(item.unit_price_cents)}</span>
                  </li>
                ))}
              </ul>

              {(order.status === "paid" || order.status === "delivering") && (
                <form action={updateOrderStatus} className="admin-entity-form">
                  <input type="hidden" name="order_id" value={order.id} />
                  <select name="status" defaultValue={order.status === "paid" ? "delivering" : "completed"}>
                    <option value="delivering">Em entrega</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                  <button>Atualizar status</button>
                </form>
              )}
            </div>
          ))}
          {orders.length === 0 && !error && <div className="empty">Nenhum pedido ainda.</div>}
        </div>
      </section>
    </AdminShell>
  );
}
