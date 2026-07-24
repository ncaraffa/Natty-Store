import { serverSupabase } from "@/lib/supabase/server";

type BannerRow = {
  id: string;
  kind: "promo" | "news" | "notice" | "event";
  title: string;
  message: string;
  link_url: string | null;
  image_url: string | null;
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
    .select("id,kind,title,message,link_url,image_url")
    .order("position", { ascending: true })
    .limit(10);

  const banners = (data ?? []) as BannerRow[];
  if (!banners.length) return null;

  return (
    <div className="list" style={{ marginBottom: 32 }}>
      {banners.map((banner) => {
        const content = (
          <article className={`notice banner-${banner.kind}`} key={banner.id} style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {banner.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner.image_url}
                alt=""
                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 12, flexShrink: 0 }}
              />
            )}
            <div>
              <span className="badge">{kindLabels[banner.kind]}</span>
              <strong style={{ display: "block", marginTop: 6 }}>{banner.title}</strong>
              {banner.message && <p style={{ margin: "4px 0 0" }}>{banner.message}</p>}
            </div>
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
