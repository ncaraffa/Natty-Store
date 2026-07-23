import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { replyToReview } from "./actions";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  admin_reply: string | null;
  created_at: string;
};

export default async function AdminAvaliacoes() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("reviews")
    .select("id,rating,comment,admin_reply,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const reviews = (data ?? []) as ReviewRow[];

  return (
    <section>
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">ADMINISTRAÇÃO</span>
          <h1>Avaliações</h1>
        </div>
        <Link href="/admin" className="button ghost">
          Voltar
        </Link>
      </div>

      {error && <div className="warning">Falha ao carregar avaliações: {error.message}</div>}

      <div className="list">
        {reviews.map((review) => (
          <div key={review.id} className="cart-line" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <div className="row">
              <div>
                <b>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</b>
                <div className="muted" style={{ fontSize: 12 }}>
                  {new Date(review.created_at).toLocaleString("pt-BR")}
                </div>
                {review.comment && <p>{review.comment}</p>}
              </div>
            </div>

            <form action={replyToReview} style={{ display: "flex", gap: 8 }}>
              <input type="hidden" name="review_id" value={review.id} />
              <textarea
                name="admin_reply"
                maxLength={2000}
                defaultValue={review.admin_reply ?? ""}
                placeholder="Responder este comentário..."
              />
              <button>Salvar resposta</button>
            </form>
          </div>
        ))}
        {reviews.length === 0 && !error && <div className="empty">Nenhuma avaliação ainda.</div>}
      </div>
    </section>
  );
}
