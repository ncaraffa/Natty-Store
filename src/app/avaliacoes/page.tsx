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
    <span className="stars" aria-label={`${value} de 5 estrelas`} title={`${value} de 5 estrelas`}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

function ReviewIcon() {
  return (
    <svg className="empty-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l2.6 5.4 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
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
      <span className="eyebrow">Clientes</span>
      <h1>Avaliações da loja</h1>

      <div className="two">
        <article className="panel rating-summary">
          <h2>Média geral</h2>
          <Stars value={average} />
          <span className="rating-value">{average.toFixed(1)}</span>
          <span className="rating-count">
            {total} avaliação{total === 1 ? "" : "s"} verificada{total === 1 ? "" : "s"}
          </span>
          <div className="rating-distribution">
            {distribution.map((row) => (
              <div className="rating-bar-row" key={row.star}>
                <span>{row.star}★</span>
                <div className="rating-bar-track">
                  <div
                    className="rating-bar-fill"
                    style={{ width: total ? `${(row.count / total) * 100}%` : "0%" }}
                  />
                </div>
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

      <div className="section-head" data-reveal>
        <div>
          <span className="eyebrow">Depoimentos</span>
          <h2>O que os clientes dizem</h2>
        </div>
      </div>
      {reviews.length === 0 ? (
        <div className="empty">
          <ReviewIcon />
          <h2>Ainda não há avaliações</h2>
          <p>Seja a primeira pessoa a avaliar uma compra na Natty Store.</p>
        </div>
      ) : (
        <div className="list" data-reveal-group>
          {reviews.map((review) => (
            <article className="cart-line review-card" data-reveal key={review.id}>
              <div>
                <div className="review-card__head">
                  <Stars value={review.rating} />
                  <span className="muted">{formatDate(review.created_at)}</span>
                  <span className="pill">Compra verificada</span>
                </div>
                {review.comment && <p>{review.comment}</p>}
                {review.admin_reply && (
                  <div className="review-card__reply">
                    <strong>Resposta da Natty Store:</strong> {review.admin_reply}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
