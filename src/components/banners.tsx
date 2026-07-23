import { serverSupabase } from "@/lib/supabase/server";

type BannerRow = {
  id: string;
  kind: "promo" | "news" | "notice" | "event";
  title: string;
  message: string;
  link_url: string | null;
};

const kindLabels: Record<BannerRow["kind"], string> = {
  promo: "Promoção",
  news: "Novidade",
  notice: "Aviso",
  event: "Evento",
};

export async function Banners() {
  const supabase = await serverSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("banners")
    .select("id,kind,title,message,link_url")
    .order("position", { ascending: true })
    .limit(10);

  const banners = (data ?? []) as BannerRow[];
  if (!banners.length) return null;

  return (
    <div className="list" style={{ marginBottom: 32 }}>
      {banners.map((banner) => {
        const content = (
          <article className={`notice banner-${banner.kind}`} key={banner.id}>
            <span className="badge">{kindLabels[banner.kind]}</span>
            <strong style={{ display: "block", marginTop: 6 }}>{banner.title}</strong>
            {banner.message && <p style={{ margin: "4px 0 0" }}>{banner.message}</p>}
          </article>
        );

        return banner.link_url ? (
          <a key={banner.id} href={banner.link_url} style={{ display: "block" }}>
            {content}
          </a>
        ) : (
          content
        );
      })}
    </div>
  );
}
