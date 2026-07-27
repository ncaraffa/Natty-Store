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
    <div className="banner-strip">
      {banners.map((banner, index) => {
        const style = { "--i": index } as React.CSSProperties;
        const body = (
          <>
            {banner.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="banner-card__image" src={banner.image_url} alt="" />
            )}
            <div className="banner-card__body">
              <span className="badge">{kindLabels[banner.kind]}</span>
              <strong>{banner.title}</strong>
              {banner.message && <p>{banner.message}</p>}
            </div>
          </>
        );

        const className = `banner-card kind-${banner.kind}`;

        return banner.link_url ? (
          <a key={banner.id} href={banner.link_url} className={className} style={style}>
            {body}
          </a>
        ) : (
          <article key={banner.id} className={className} style={style}>
            {body}
          </article>
        );
      })}
    </div>
  );
}
