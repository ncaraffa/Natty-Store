import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { createBanner, updateBanner, deleteBanner } from "./actions";

export const dynamic = "force-dynamic";

type BannerRow = {
  id: string;
  kind: string;
  title: string;
  message: string;
  link_url: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

export default async function AdminBanners() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("banners")
    .select("id,kind,title,message,link_url,active,starts_at,ends_at")
    .order("position", { ascending: true });

  const banners = (data ?? []) as BannerRow[];

  return (
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
        <form action={createBanner} className="admin-new-form">
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
            Início (opcional)
            <input name="starts_at" type="datetime-local" />
          </label>
          <label>
            Fim (opcional)
            <input name="ends_at" type="datetime-local" />
          </label>
          <label>
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
          <div key={banner.id} className="cart-line" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <form action={updateBanner} className="admin-new-form">
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
                Início
                <input name="starts_at" type="datetime-local" defaultValue={toLocalInput(banner.starts_at)} />
              </label>
              <label>
                Fim
                <input name="ends_at" type="datetime-local" defaultValue={toLocalInput(banner.ends_at)} />
              </label>
              <label>
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
            <form action={deleteBanner}>
              <input type="hidden" name="id" value={banner.id} />
              <button className="link-button" type="submit">
                Remover banner
              </button>
            </form>
          </div>
        ))}
        {banners.length === 0 && !error && <div className="empty">Nenhum banner cadastrado ainda.</div>}
      </div>
    </section>
  );
}
