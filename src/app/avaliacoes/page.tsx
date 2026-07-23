import { serverSupabase } from "@/lib/supabase/server";
import { submitReview } from "./actions";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  admin_reply: string | null;
  admin_reply_at: string | null;
  created_at: string;
};

type StatsRow = {
  total_reviews: number;
  average_rating: number;
  star_5: number;
  star_4: number;
  star_3: number;
  star_2: number;
  star_1: number;
};

type EligibleOrderRow = { id: string; created_at: string };

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span aria-label={`${value} de 5 estrelas`} title={`${value} de 5 estrelas`}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Campo_Grande",
  }).format(date);
}

export default async function Avaliacoes() {
  const supabase = await serverSupabase();

  const [statsResult, reviewsResult, authResult] = supabase
    ? await Promise.all([
        supabase.from("review_stats").select("*").single(),
        supabase
          .from("reviews")
          .select("id,rating,comment,admin_reply,admin_reply_at,created_at")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.auth.getUser(),
      ])
    : [{ data: null, error: null }, { data: [], error: null }, { data: { user: null } }];

  const stats = (statsResult.data ?? null) as StatsRow | null;
  const reviews = (reviewsResult.data ?? []) as ReviewRow[];
  const user = authResult.data.user;

  let eligibleOrders: EligibleOrderRow[] = [];

  if (supabase && user) {
    const ordersResult = await supabase
      .from("orders")
      .select("id,created_at")
      .in("status", ["paid", "delivering", "completed"])
      .order("created_at", { ascending: false });

    if (!ordersResult.error) {
      const orderIds = (ordersResult.data ?? []).map((order) => order.id);
      let reviewedIds = new Set<string>();

      if (orderIds.length) {
        const reviewedResult = await supabase
          .from("reviews")
          .select("order_id")
          .in("order_id", orderIds);

        reviewedIds = new Set((reviewedResult.data ?? []).map((row) => row.order_id));
      }

      eligibleOrders = (ordersResult.data ?? []).filter(
        (order) => !reviewedIds.has(order.id),
      ) as EligibleOrderRow[];
    }
  }

  const total = stats?.total_reviews ?? 0;
  const average = stats?.average_rating ?? 0;
  const distribution = [
    { star: 5, count: stats?.star_5 ?? 0 },
    { star: 4, count: stats?.star_4 ?? 0 },
    { star: 3, count: stats?.star_3 ?? 0 },
    { star: 2, count: stats?.star_2 ?? 0 },
    { star: 1, count: stats?.star_1 ?? 0 },
  ];

  return (
    <section>
      <span className="eyebrow">CLIENTES</span>
      <h1>Avaliações da loja</h1>

      <div className="two">
        <article className="panel">
          <h2>Média geral</h2>
          <p style={{ fontSize: "2rem" }}>
            <Stars value={average} /> {average.toFixed(2)}
          </p>
          <p>{total} avaliação{total === 1 ? "" : "s"} verificada{total === 1 ? "" : "s"}</p>
          <div className="list">
            {distribution.map((row) => (
              <div key={row.star} style={{ display: "flex", gap: "0.5rem" }}>
                <span>{row.star}★</span>
                <span>{row.count}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Deixe sua avaliação</h2>
          {!user ? (
            <p>Entre na sua conta para avaliar uma compra já realizada.</p>
          ) : eligibleOrders.length === 0 ? (
            <p>Nenhum pedido pendente de avaliação no momento.</p>
          ) : (
            <form action={submitReview}>
              <label>
                Pedido
                <select name="order_id" required>
                  {eligibleOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      Pedido de {formatDate(order.created_at)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nota
                <select name="rating" required defaultValue="5">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <option key={star} value={star}>
                      {star} estrela{star === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Comentário (opcional)
                <textarea
                  name="comment"
                  maxLength={2000}
                  placeholder="Conte como foi o atendimento, a entrega e a experiência de compra."
                />
              </label>
              <button type="submit">Enviar avaliação</button>
            </form>
          )}
        </article>
      </div>

      <h2>O que os clientes dizem</h2>
      {reviews.length === 0 ? (
        <div className="empty">Ainda não há avaliações.</div>
      ) : (
        <div className="list">
          {reviews.map((review) => (
            <article className="cart-line" key={review.id}>
              <div>
                <p>
                  <Stars value={review.rating} /> · {formatDate(review.created_at)}{" "}
                  <span className="pill">Compra verificada</span>
                </p>
                {review.comment && <p>{review.comment}</p>}
                {review.admin_reply && (
                  <p>
                    <strong>Resposta da Natty Store:</strong> {review.admin_reply}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
