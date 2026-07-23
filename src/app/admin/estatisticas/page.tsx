import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type OrderStatsRow = { status: string; payment_status: string; total_cents: number };
type BestSellerRow = { product_name_snapshot: string; quantity: number };

function toReais(cents: number) {
  return (cents / 100).toFixed(2);
}

export default async function AdminEstatisticas() {
  const { db } = await requireAdmin();

  const [ordersResult, itemsResult, productsResult] = await Promise.all([
    db.from("orders").select("status,payment_status,total_cents"),
    db.from("order_items").select("product_name_snapshot,quantity"),
    db.from("products").select("id", { count: "exact", head: true }),
  ]);

  const orders = (ordersResult.data ?? []) as OrderStatsRow[];
  const items = (itemsResult.data ?? []) as BestSellerRow[];

  const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "delivering" || o.status === "completed");
  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.total_cents, 0);
  const pendingOrders = orders.filter((o) => o.status === "stock_reserved" || o.status === "pending_payment").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled" || o.status === "expired").length;

  const bestSellers = new Map<string, number>();
  for (const item of items) {
    bestSellers.set(item.product_name_snapshot, (bestSellers.get(item.product_name_snapshot) ?? 0) + item.quantity);
  }
  const topProducts = Array.from(bestSellers.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <section>
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">ADMINISTRAÇÃO</span>
          <h1>Estatísticas</h1>
        </div>
        <Link href="/admin" className="button ghost">
          Voltar
        </Link>
      </div>

      <div className="grid">
        <article className="panel">
          <h2>Receita paga</h2>
          <p style={{ fontSize: "1.8rem" }}>R$ {toReais(totalRevenueCents)}</p>
          <p>{paidOrders.length} pedido{paidOrders.length === 1 ? "" : "s"} pago{paidOrders.length === 1 ? "" : "s"}</p>
        </article>
        <article className="panel">
          <h2>Total de pedidos</h2>
          <p style={{ fontSize: "1.8rem" }}>{orders.length}</p>
          <p>{pendingOrders} pendente{pendingOrders === 1 ? "" : "s"} · {cancelledOrders} cancelado{cancelledOrders === 1 ? "" : "s"}</p>
        </article>
        <article className="panel">
          <h2>Produtos cadastrados</h2>
          <p style={{ fontSize: "1.8rem" }}>{productsResult.count ?? 0}</p>
        </article>
      </div>

      <h2>Mais vendidos</h2>
      {topProducts.length === 0 ? (
        <div className="empty">Nenhuma venda registrada ainda.</div>
      ) : (
        <div className="list">
          {topProducts.map(([name, quantity]) => (
            <div key={name} className="cart-line">
              <span>{name}</span>
              <strong>{quantity} unidade{quantity === 1 ? "" : "s"}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
