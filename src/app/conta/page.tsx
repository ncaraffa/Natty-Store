import { AuthPanel } from "@/components/auth-panel";
import { SignOutButton } from "@/components/sign-out-button";
import { SwitchAccountButton } from "@/components/switch-account-button";
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

const orderLabels: Record<string, string> = {
  draft: "Recebido para análise",
  stock_reserved: "Estoque reservado",
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  delivering: "Em entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  expired: "Expirado",
};

const orderStatusTone: Record<string, string> = {
  paid: "is-positive",
  delivering: "is-positive",
  completed: "is-positive",
  pending_payment: "is-attention",
  stock_reserved: "is-attention",
  draft: "is-attention",
  cancelled: "is-negative",
  refunded: "is-negative",
  expired: "is-negative",
};

function OrderIcon() {
  return (
    <svg className="empty-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16l-1.5 12.2a1.5 1.5 0 0 1-1.5 1.3H7a1.5 1.5 0 0 1-1.5-1.3L4 7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const PENDING_DISPLAY_WINDOW_MS = 5 * 60 * 1000;

function paymentDisplay(order: OrderRow): { label: string; tone: string } {
  if (order.payment_status === "approved") {
    return { label: "Pago", tone: "is-positive" };
  }
  if (order.payment_status === "rejected") {
    return { label: "Pagamento rejeitado", tone: "is-negative" };
  }
  if (order.payment_status === "refunded") {
    return { label: "Pagamento reembolsado", tone: "is-negative" };
  }

  const elapsedMs = Date.now() - new Date(order.created_at).getTime();

  if (elapsedMs < PENDING_DISPLAY_WINDOW_MS) {
    return { label: "Pagamento pendente", tone: "is-attention" };
  }

  return { label: "Não foi pago", tone: "is-negative" };
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

export default async function Account() {
  const supabase = await serverSupabase();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  let orders: OrderRow[] = [];
  let items: OrderItemRow[] = [];
  let loadError = false;

  if (supabase && authData.user) {
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
          .select(
            "order_id,product_name_snapshot,unit_price_cents,quantity",
          )
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
  }

  return (
    <section>
      <span className="eyebrow">Área do cliente</span>
      <h1>Minha conta</h1>

      <div className="two">
        <article className="panel account-card">
          {authData.user ? (
            <>
              <h2>Acesso confirmado</h2>
              <span className="account-user-email">{authData.user.email}</span>
              <p>
                Esta conta mostra somente pedidos vinculados ao seu usuário
                autenticado.
              </p>
              <div className="account-actions">
                <SignOutButton />
                <SwitchAccountButton />
              </div>
            </>
          ) : (
            <AuthPanel title="Entrar ou criar conta por e-mail" />
          )}
        </article>

        <article className="panel">
          <h2>Meus pedidos</h2>
          <p className="field-help" style={{ marginTop: -8, marginBottom: 8 }}>
            Acompanhe aqui o status de pagamento de cada pedido em tempo real.
          </p>

          {!authData.user ? (
            <p>Entre por e-mail para consultar seus próprios pedidos.</p>
          ) : loadError ? (
            <div className="warning">
              Não foi possível carregar os pedidos agora.
            </div>
          ) : !orders.length ? (
            <div className="empty">
              <OrderIcon />
              <h2>Nenhum pedido encontrado</h2>
              <p>Seus pedidos aparecerão aqui assim que forem criados.</p>
            </div>
          ) : (
            <div className="list">
              {orders.map((order) => {
                const orderItems = items.filter(
                  (item) => item.order_id === order.id,
                );

                const payment = paymentDisplay(order);

                return (
                  <article className="cart-line order-card" key={order.id}>
                    <div className="order-card__head">
                      <div>
                        <h3>{orderLabels[order.status] ?? order.status}</h3>
                        <span className="order-card__meta">{formatDate(order.created_at)}</span>
                      </div>
                      <strong className="order-card__total price">{money(order.total_cents)}</strong>
                    </div>

                    <div className="row">
                      <span className={`order-status ${orderStatusTone[order.status] ?? ""}`}>
                        {orderLabels[order.status] ?? order.status}
                      </span>
                      <span className={`order-status ${payment.tone}`}>{payment.label}</span>
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
        </article>
      </div>
    </section>
  );
}
