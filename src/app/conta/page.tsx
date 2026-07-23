import { AuthPanel } from "@/components/auth-panel";
import { SignOutButton } from "@/components/sign-out-button";
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

const paymentLabels: Record<string, string> = {
  not_started: "Pagamento não iniciado",
  pending: "Pagamento pendente",
  approved: "Pagamento aprovado",
  rejected: "Pagamento rejeitado",
  refunded: "Pagamento reembolsado",
};

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
      <span className="eyebrow">ÁREA DO CLIENTE</span>
      <h1>Minha conta</h1>

      <div className="two">
        <article className="panel">
          {authData.user ? (
            <>
              <h2>Acesso confirmado</h2>
              <p>{authData.user.email}</p>
              <p>
                Esta conta mostra somente pedidos vinculados ao seu usuário
                autenticado.
              </p>
              <SignOutButton />
            </>
          ) : (
            <AuthPanel />
          )}
        </article>

        <article className="panel">
          <h2>Meus pedidos</h2>

          {!authData.user ? (
            <p>Entre por e-mail para consultar seus próprios pedidos.</p>
          ) : loadError ? (
            <div className="warning">
              Não foi possível carregar os pedidos agora.
            </div>
          ) : !orders.length ? (
            <div className="empty">Nenhum pedido encontrado para esta conta.</div>
          ) : (
            <div className="list">
              {orders.map((order) => {
                const orderItems = items.filter(
                  (item) => item.order_id === order.id,
                );

                return (
                  <article className="cart-line" key={order.id}>
                    <div>
                      <h3>{orderLabels[order.status] ?? order.status}</h3>
                      <p>{formatDate(order.created_at)}</p>
                      <p>
                        {paymentLabels[order.payment_status] ??
                          order.payment_status}
                      </p>

                      {orderItems.map((item) => (
                        <p
                          key={`${order.id}-${item.product_name_snapshot}`}
                        >
                          {item.quantity}× {item.product_name_snapshot} —{" "}
                          {money(item.unit_price_cents * item.quantity)}
                        </p>
                      ))}
                    </div>

                    <strong>{money(order.total_cents)}</strong>
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
