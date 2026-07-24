import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import { AdminConfirmButton } from "@/components/admin-confirm-button";
import { createBanner, updateBanner, deleteBanner } from "./actions";

export const dynamic = "force-dynamic";

type BannerRow = {
  id: string;
  kind: string;
  title: string;
  message: string;
  link_url: string | null;
  image_url: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

const kindLabels: Record<string, string> = {
  promo: "Promoção",
  news: "Novidade",
  notice: "Aviso",
  event: "Evento",
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

export default async function AdminBanners() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("banners")
    .select("id,kind,title,message,link_url,image_url,active,starts_at,ends_at")
    .order("position", { ascending: true });

  const banners = (data ?? []) as BannerRow[];

  return (
    <AdminShell activeKey="banners">
      <section>
        <div className="admin-toolbar">
          <div>
            <span className="eyebrow">ADMINISTRAÇÃO</span>
            <h1>Banners</h1>
          </div>
          <Link href="/admin" className="button ghost">
            Voltar
          </Link>
        </div>

        {error && <div className="warning">Falha ao carregar banners: {error.message}</div>}

        <div className="panel">
          <h2>Novo banner</h2>
          <form action={createBanner} className="admin-new-form" encType="multipart/form-data">
            <label>
              Tipo
              <select name="kind" defaultValue="promo">
                <option value="promo">Promoção</option>
                <option value="news">Novidade</option>
                <option value="notice">Aviso</option>
                <option value="event">Evento</option>
              </select>
            </label>
            <label>
              Título
              <input name="title" required maxLength={150} />
            </label>
            <label>
              Link (opcional)
              <input name="link_url" placeholder="/mm2" />
            </label>
            <label>
              Imagem (arquivo, opcional)
              <input name="image_file" type="file" accept="image/*" />
            </label>
            <label>
              Imagem (URL, opcional se enviar arquivo)
              <input name="image_url" placeholder="https://..." />
            </label>
            <label>
              Início (opcional)
              <input name="starts_at" type="datetime-local" />
            </label>
            <label>
              Fim (opcional)
              <input name="ends_at" type="datetime-local" />
            </label>
            <label className="checkbox-field">
              <input type="checkbox" name="active" style={{ width: "auto", display: "inline-block" }} /> Ativo
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              Mensagem
              <textarea name="message" rows={2} maxLength={500} />
            </label>
            <button>Criar banner</button>
          </form>
        </div>

        <div className="list">
          {banners.map((banner) => (
            <div key={banner.id} className="cart-line admin-entity-card">
              <div className="admin-entity-head">
                <div className="admin-badge-row">
                  <span className="badge">{kindLabels[banner.kind] ?? banner.kind}</span>
                  <span className={`badge ${banner.active ? "badge-success" : "badge-neutral"}`}>
                    {banner.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
              <form action={updateBanner} className="admin-new-form" encType="multipart/form-data">
                <input type="hidden" name="id" value={banner.id} />
                <label>
                  Tipo
                  <select name="kind" defaultValue={banner.kind}>
                    <option value="promo">Promoção</option>
                    <option value="news">Novidade</option>
                    <option value="notice">Aviso</option>
                    <option value="event">Evento</option>
                  </select>
                </label>
                <label>
                  Título
                  <input name="title" defaultValue={banner.title} required maxLength={150} />
                </label>
                <label>
                  Link
                  <input name="link_url" defaultValue={banner.link_url ?? ""} />
                </label>
                <label>
                  {banner.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={banner.image_url} alt="" className="admin-cell-thumb" style={{ width: 60 }} />
                  )}
                  Imagem (arquivo)
                  <input name="image_file" type="file" accept="image/*" />
                </label>
                <label>
                  Imagem (URL)
                  <input name="image_url" defaultValue={banner.image_url ?? ""} placeholder="ou cole uma URL" />
                </label>
                <label>
                  Início
                  <input name="starts_at" type="datetime-local" defaultValue={toLocalInput(banner.starts_at)} />
                </label>
                <label>
                  Fim
                  <input name="ends_at" type="datetime-local" defaultValue={toLocalInput(banner.ends_at)} />
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={banner.active}
                    style={{ width: "auto", display: "inline-block" }}
                  />{" "}
                  Ativo
                </label>
                <label style={{ gridColumn: "1 / -1" }}>
                  Mensagem
                  <textarea name="message" rows={2} maxLength={500} defaultValue={banner.message} />
                </label>
                <button>Salvar</button>
              </form>
              <form action={deleteBanner} className="admin-entity-actions">
                <input type="hidden" name="id" value={banner.id} />
                <AdminConfirmButton
                  className="link-button"
                  confirmMessage={`Remover o banner "${banner.title}"? Essa ação não pode ser desfeita.`}
                >
                  Remover banner
                </AdminConfirmButton>
              </form>
            </div>
          ))}
          {banners.length === 0 && !error && <div className="empty">Nenhum banner cadastrado ainda.</div>}
        </div>
      </section>
    </AdminShell>
  );
}
