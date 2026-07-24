import Link from "next/link";
import { money } from "@/lib/catalog-display";
import { serverSupabase } from "@/lib/supabase/server";

type OrderRow = {
  id: string;
  status: string;
  payment_status: string;
  total_cents: number;
  created_at: string;
};

type OrderItemRow = {
  order_id: string;
  product_name_snapshot: string;
  unit_price_cents: number;
  quantity: number;
};

const PENDING_DISPLAY_WINDOW_MS = 5 * 60 * 1000;

function trackingStatus(order: OrderRow): { label: string; tone: string } {
  if (order.status === "completed") {
    return { label: "Entregue", tone: "is-positive" };
  }
  if (order.status === "cancelled") {
    return { label: "Cancelado", tone: "is-negative" };
  }
  if (order.status === "refunded" || order.payment_status === "refunded") {
    return { label: "Reembolsado", tone: "is-negative" };
  }
  if (order.payment_status === "rejected") {
    return { label: "Pagamento rejeitado", tone: "is-negative" };
  }
  if (order.status === "expired") {
    return { label: "Expirado", tone: "is-negative" };
  }
  if (order.payment_status === "approved") {
    return { label: "Pago, em processo de envio", tone: "is-attention" };
  }

  const elapsedMs = Date.now() - new Date(order.created_at).getTime();

  if (elapsedMs < PENDING_DISPLAY_WINDOW_MS) {
    return { label: "Pagamento pendente", tone: "is-attention" };
  }

  return { label: "Expirado", tone: "is-negative" };
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Data indisponível";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Campo_Grande",
  }).format(date);
}

function BagIcon() {
  return (
    <svg className="empty-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l1.2 12.2a1.5 1.5 0 0 1-1.5 1.8H6.3a1.5 1.5 0 0 1-1.5-1.8L6 8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default async function MinhasCompras() {
  const supabase = await serverSupabase();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!supabase || !authData.user) {
    return (
      <section className="narrow">
        <span className="eyebrow">Acompanhamento</span>
        <h1>Minhas compras</h1>
        <p>
          Entre na sua conta para acompanhar o status de pagamento e entrega
          dos seus pedidos.
        </p>
        <Link className="button" href="/conta">
          Entrar na minha conta
        </Link>
      </section>
    );
  }

  let orders: OrderRow[] = [];
  let items: OrderItemRow[] = [];
  let loadError = false;

  const ordersResult = await supabase
    .from("orders")
    .select("id,status,payment_status,total_cents,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (ordersResult.error) {
    console.error("Falha ao carregar pedidos do cliente:", {
      code: ordersResult.error.code,
    });
    loadError = true;
  } else {
    orders = (ordersResult.data ?? []) as OrderRow[];

    const orderIds = orders.map((order) => order.id);

    if (orderIds.length) {
      const itemsResult = await supabase
        .from("order_items")
        .select("order_id,product_name_snapshot,unit_price_cents,quantity")
        .in("order_id", orderIds)
        .order("product_name_snapshot", { ascending: true });

      if (itemsResult.error) {
        console.error("Falha ao carregar itens dos pedidos:", {
          code: itemsResult.error.code,
        });
        loadError = true;
      } else {
        items = (itemsResult.data ?? []) as OrderItemRow[];
      }
    }
  }

  return (
    <section>
      <span className="eyebrow">Acompanhamento</span>
      <h1>Minhas compras</h1>
      <p>
        O status é atualizado direto do nosso banco de dados — recarregue a
        página a qualquer momento para ver a situação mais recente.
      </p>

      {loadError ? (
        <div className="warning">Não foi possível carregar seus pedidos agora.</div>
      ) : !orders.length ? (
        <div className="empty">
          <BagIcon />
          <h2>Nenhuma compra encontrada</h2>
          <p>Suas compras aparecerão aqui assim que forem criadas.</p>
          <Link className="button" href="/">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="list">
          {orders.map((order) => {
            const orderItems = items.filter((item) => item.order_id === order.id);
            const tracking = trackingStatus(order);

            return (
              <article className="cart-line order-card" key={order.id}>
                <div className="order-card__head">
                  <div>
                    <h3>Pedido de {formatDate(order.created_at)}</h3>
                    <span className="order-card__meta">#{order.id.slice(0, 8)}</span>
                  </div>
                  <strong className="order-card__total price">{money(order.total_cents)}</strong>
                </div>

                <div className="row">
                  <span className={`order-status ${tracking.tone}`}>{tracking.label}</span>
                </div>

                {orderItems.length > 0 && (
                  <div className="order-card__items">
                    {orderItems.map((item) => (
                      <p key={`${order.id}-${item.product_name_snapshot}`}>
                        {item.quantity}× {item.product_name_snapshot} —{" "}
                        {money(item.unit_price_cents * item.quantity)}
                      </p>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
