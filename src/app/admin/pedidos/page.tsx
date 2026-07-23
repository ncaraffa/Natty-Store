import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
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

const paymentStatusLabels: Record<string, string> = {
  not_started: "Não iniciado",
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  refunded: "Reembolsado",
};

export default async function AdminOrders() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("orders")
    .select(
      "id,guest_roblox_nick,guest_contact,status,payment_status,total_cents,created_at,order_items(product_name_snapshot,quantity,unit_price_cents)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (data ?? []) as unknown as OrderRow[];

  return (
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
          <div key={order.id} className="cart-line" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <div className="row">
              <div>
                <b>{order.guest_roblox_nick}</b> — {order.guest_contact}
                <div className="muted" style={{ fontSize: 12 }}>
                  {new Date(order.created_at).toLocaleString("pt-BR")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="badge">{statusLabels[order.status] ?? order.status}</span>{" "}
                <span className="badge">
                  pagamento: {paymentStatusLabels[order.payment_status] ?? order.payment_status}
                </span>
                <div>
                  <b>R$ {toReais(order.total_cents)}</b>
                </div>
              </div>
            </div>

            <ul>
              {order.order_items.map((item, index) => (
                <li key={index}>
                  {item.quantity}x {item.product_name_snapshot} — R$ {toReais(item.unit_price_cents)}
                </li>
              ))}
            </ul>

            {(order.status === "paid" || order.status === "delivering") && (
              <form action={updateOrderStatus} style={{ display: "flex", gap: 8 }}>
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
  );
}
