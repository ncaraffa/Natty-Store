import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
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
    <AdminShell activeKey="avaliacoes">
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
          {reviews.map((review) => {
            const replied = Boolean(review.admin_reply && review.admin_reply.trim());
            return (
              <div key={review.id} className="cart-line admin-entity-card">
                <div className="admin-entity-head">
                  <div>
                    <b className="admin-rating" aria-label={`${review.rating} de 5 estrelas`}>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </b>
                    <div className="admin-entity-meta">{new Date(review.created_at).toLocaleString("pt-BR")}</div>
                    {review.comment && <p>{review.comment}</p>}
                  </div>
                  <span className={`badge ${replied ? "badge-success" : "badge-warning"}`}>
                    {replied ? "Respondida" : "Sem resposta"}
                  </span>
                </div>

                <form action={replyToReview} className="admin-entity-form">
                  <input type="hidden" name="review_id" value={review.id} />
                  <textarea
                    name="admin_reply"
                    maxLength={2000}
                    defaultValue={review.admin_reply ?? ""}
                    placeholder="Responder este comentário..."
                    style={{ flex: 1, minWidth: 220 }}
                  />
                  <button>Salvar resposta</button>
                </form>
              </div>
            );
          })}
          {reviews.length === 0 && !error && <div className="empty">Nenhuma avaliação ainda.</div>}
        </div>
      </section>
    </AdminShell>
  );
}
