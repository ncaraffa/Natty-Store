import Link from "next/link";
import { Banners } from "@/components/banners";
import { HowToBuyDemo } from "@/components/how-to-buy-demo";
import { ProductCard } from "@/components/product-card";
import { Blob, Burst, Scribble, Smiley, Sparkle, Squiggle } from "@/components/doodles";
import { getCatalogProducts } from "@/lib/catalog";
import type { Category, Product } from "@/types";

function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PixIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3.5l3.3 3.3a2.4 2.4 0 0 0 3.4 0L18 3.5M8 20.5l3.3-3.3a2.4 2.4 0 0 1 3.4 0l3.3 3.3M3.5 16l3.3-3.3a2.4 2.4 0 0 0 0-3.4L3.5 6M20.5 6l-3.3 3.3a2.4 2.4 0 0 0 0 3.4l3.3 3.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinesDoodle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 70" fill="none" aria-hidden="true">
      {[6, 18, 30, 42, 54].map((x) => (
        <path key={x} d={`M${x} 64L${x + 6} 6`} stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      ))}
    </svg>
  );
}

const categories: { key: Category; href: string; name: string; blurb: string }[] = [
  { key: "mm2", href: "/mm2", name: "MM2", blurb: "Skins, armas e sets." },
  { key: "ftf", href: "/ftf", name: "Flee the Facility", blurb: "Sets e marretas para escapar com estilo." },
  { key: "adopt-me", href: "/adopt-me", name: "Adopt Me", blurb: "Pets e itens fofos para o seu mundo." },
];

const badgeRank: Record<string, number> = { bestseller: 0, featured: 1, promo: 2, new: 3 };

function rankForShowcase(products: Product[]) {
  return [...products].sort((a, b) => {
    const rankA = a.badge ? badgeRank[a.badge] : 9;
    const rankB = b.badge ? badgeRank[b.badge] : 9;
    if (rankA !== rankB) return rankA - rankB;
    return Number(Boolean(b.image)) - Number(Boolean(a.image));
  });
}

export default async function Home() {
  const products = await getCatalogProducts();
  const showcase = rankForShowcase(products);
  const withImages = showcase.filter((product) => product.image);
  const collage = withImages.slice(0, 3);
  const bestSellers = showcase.slice(0, 8);
  const coverByCategory = new Map<Category, Product>();
  for (const product of withImages) {
    if (!coverByCategory.has(product.category)) coverByCategory.set(product.category, product);
  }
  const year = new Date().getFullYear();

  return (
    <>
      <Banners />

      <section className="sw-hero" aria-labelledby="hero-title">
        <div className="sw-hero__copy">
          <p className="sw-hero__kicker">Itens de Roblox para uma coleção mais brilhante</p>
          <h1 id="hero-title" className="sw-hero__title sw-bubble" aria-label="Boa jogada">
            <span aria-hidden="true">Boa</span>
            <span aria-hidden="true">jogada</span>
            <Sparkle className="sw-doodle sw-sparkle sw-hero__title-star" />
            <Sparkle className="sw-doodle sw-sparkle sw-hero__title-star sw-hero__title-star--sm" />
          </h1>
          <p className="sw-hero__lead">
            Itens raros, gente boa. A Natty Store é a lojinha de MM2, Flee the
            Facility e Adopt Me para quem joga com estilo — com reserva
            automática de estoque e pagamento via Pix.
          </p>
          <div className="hero-actions">
            <Link className="button" href="#catalogo">
              Ver catálogo <ArrowIcon />
            </Link>
            <Link className="button ghost" href="/encomendas">
              Fazer encomenda
            </Link>
          </div>
          <ul className="sw-stats">
            {products.length > 0 && (
              <li>
                <strong>{products.length}</strong>
                <span>itens no catálogo</span>
              </li>
            )}
            <li>
              <strong>3</strong>
              <span>jogos na loja</span>
            </li>
            <li className="sw-stats__icon">
              <PixIcon />
              <span>Pix com confirmação automática</span>
            </li>
          </ul>
        </div>

        <div className="sw-hero__visual" aria-hidden="true">
          <Blob className="sw-hero__blob" />
          <div className="sw-collage">
            {collage.length > 0 ? (
              collage.map((product, index) => (
                <figure key={product.id} className={`sw-sticker sw-sticker--${index + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt="" />
                  <figcaption>{product.name}</figcaption>
                </figure>
              ))
            ) : (
              <div className="sw-sticker sw-sticker--logo sw-bubble">N</div>
            )}
          </div>
          <Burst className="sw-hero__burst">Boa vibe, item raro</Burst>
          <span className="sw-hand sw-hand--1">Joga bonito :)</span>
          <span className="sw-hand sw-hand--2">
            Mesma loja,
            <br />
            itens novos
          </span>
          <Squiggle className="sw-doodle sw-hero__squiggle" />
        </div>
      </section>

      <section className="sw-section" aria-labelledby="games-heading">
        <div className="sw-section-head" data-reveal>
          <h2 id="games-heading">
            Compre por <em>jogo</em>
            <Sparkle className="sw-section-head__doodle sw-sparkle" />
          </h2>
          <Link className="sw-see-all" href="/busca">
            Ver tudo <ArrowIcon size={16} />
          </Link>
        </div>
        <div className="sw-cat-grid" data-reveal-group>
          {categories.map((category) => {
            const cover = coverByCategory.get(category.key);
            return (
              <Link
                key={category.key}
                href={category.href}
                className={`sw-cat sw-cat--${category.key}`}
                data-reveal
              >
                <Scribble className="sw-doodle sw-cat__scribble" />
                <Sparkle className="sw-doodle sw-sparkle sw-cat__sparkle" />
                <span className="sw-cat__media" aria-hidden="true">
                  {cover?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.image} alt="" loading="lazy" />
                  ) : (
                    <span className="sw-cat__fallback sw-bubble">★</span>
                  )}
                </span>
                <span className="sw-cat__bar">
                  <span className="sw-cat__label">
                    <strong>{category.name}</strong>
                    <span>{category.blurb}</span>
                  </span>
                  <span className="sw-cat__arrow" aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="sw-section" aria-labelledby="custom-order-heading">
        <Link className="sw-promo" href="/encomendas" data-reveal>
          <span className="sw-promo__tag">
            Pedido
            <br />
            personalizado
            <small>{`// ${year}`}</small>
          </span>
          <LinesDoodle className="sw-promo__lines" />
          <h2 id="custom-order-heading" className="sw-promo__title sw-bubble">
            <span>Não achou?</span>
            <span>A gente</span>
            <span>encontra.</span>
          </h2>
          <span className="sw-promo__cta">
            <span className="sw-promo__arrow" aria-hidden="true">
              <ArrowIcon size={22} />
            </span>
            <span>
              Fazer uma
              <br />
              encomenda
            </span>
          </span>
        </Link>
      </section>

      <HowToBuyDemo />

      <section id="catalogo" className="sw-best" aria-labelledby="best-heading">
        <div className="sw-best__main">
          <div className="sw-section-head" data-reveal>
            <div>
              <h2 id="best-heading">
                Em <em>destaque</em>
                <Squiggle className="sw-section-head__squiggle" />
              </h2>
              <p>Produtos reais, cadastrados e ativados diretamente pela administradora.</p>
            </div>
            {products.length > bestSellers.length && (
              <Link className="sw-see-all" href="/busca">
                Ver todos os {products.length} itens <ArrowIcon size={16} />
              </Link>
            )}
          </div>

          {bestSellers.length ? (
            <div className="sw-best__grid" data-reveal-group>
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h2>Nenhum produto publicado ainda.</h2>
              <p>O catálogo exibirá somente produtos reais cadastrados e ativados.</p>
            </div>
          )}
        </div>

        <aside className="sw-best__aside" aria-label="Sua conta na Natty Store">
          <div className="sw-best__aside-inner" data-reveal>
            <p className="sw-best__aside-title">
              Gente boa,
              <br />
              jogo bom
              <Smiley />
            </p>
            <p>
              Entre na sua conta para acompanhar seus pedidos em Minhas compras
              e falar com a loja pelo chat.
            </p>
            <Link className="button" href="/conta">
              Entrar ou criar conta <ArrowIcon />
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
