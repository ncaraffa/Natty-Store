import Link from "next/link";
import Image from "next/image";
import { Catalog } from "@/components/catalog";
import { Banners } from "@/components/banners";

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h16v11H9l-4 4V5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
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

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 9h16M12 9v11" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 9S8 8.5 8 6a2 2 0 0 1 4 0 2 2 0 0 1 4 0c0 2.5-4 3-4 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <svg className="hero-sparkle" style={style} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c1 5.5 5.5 10 11 11-5.5 1-10 5.5-11 11-1-5.5-5.5-10-11-11 5.5-1 10-5.5 11-11z" />
    </svg>
  );
}

const games = [
  {
    href: "/mm2",
    theme: "theme-mm2",
    name: "Murder Mystery 2",
    tag: "MM2",
    blurb: "Skins, armas e sets.",
  },
  {
    href: "/ftf",
    theme: "theme-ftf",
    name: "Flee the Facility",
    tag: "FTF",
    blurb: "Sets e marretas para escapar com estilo.",
  },
  {
    href: "/adopt-me",
    theme: "theme-adopt",
    name: "Adopt Me",
    tag: "Adopt Me",
    blurb: "Pets e itens fofos para o seu mundo em Adopt Me.",
  },
];

export default function Home() {
  return (
    <>
      <Banners />

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Sua coleção começa aqui ✦</span>
          <h1>
            Itens especiais,
            <br />
            <em>do seu jeito.</em>
          </h1>
          <p>
            Uma lojinha fofa e confiável para encontrar itens de MM2, Flee
            the Facility e Adopt Me — com reserva automática de estoque e
            pagamento via Pix.
          </p>
          <div className="hero-actions">
            <Link className="button" href="#catalogo">
              Ver catálogo
            </Link>
            <Link className="button ghost" href="/encomendas">
              Fazer encomenda
            </Link>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <Sparkle style={{ top: "6%", right: "4%", animationDelay: "0.3s" }} />
          <Sparkle style={{ bottom: "10%", left: "-2%", width: 14, height: 14, animationDelay: "1.1s" }} />
          <div className="logo-card-wrap">
            <div className="logo-card">
              <Image
                className="logo-card__img"
                src="/logo.png"
                alt="Natty Store"
                width={420}
                height={420}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="games-heading">
        <div className="section-head">
          <div>
            <span className="eyebrow">Escolha seu jogo</span>
            <h2 id="games-heading">Navegue por categoria</h2>
          </div>
        </div>
        <div className="game-nav-grid">
          {games.map((game) => (
            <Link key={game.href} href={game.href} className={`game-nav-card ${game.theme}`}>
              <div className="game-nav-card__body">
                <span className="eyebrow">{game.tag}</span>
                <h3>{game.name}</h3>
                <p>{game.blurb}</p>
                <span className="game-nav-card__link">
                  Ver itens <ArrowIcon />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="catalogo">
        <div className="section-head">
          <div>
            <span className="eyebrow">Destaques</span>
            <h2>Explore a loja</h2>
            <p>Produtos reais, cadastrados e ativados diretamente pela administradora.</p>
          </div>
        </div>
        <Catalog />
      </section>

      <section aria-labelledby="custom-order-heading">
        <div className="custom-order-banner">
          <div>
            <span className="eyebrow">Não achou o que queria?</span>
            <h2 id="custom-order-heading">Peça uma encomenda personalizada</h2>
            <p>
              Conte o item que você procura em MM2, FTF ou Adopt Me. Sua
              solicitação é analisada diretamente pela administradora da loja.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/encomendas">
                Fazer encomenda
              </Link>
            </div>
          </div>
          <div className="custom-order-banner__art">
            <GiftIcon />
          </div>
        </div>
      </section>

      <section aria-labelledby="trust-heading">
        <h2 className="sr-only" id="trust-heading">
          Por que comprar na Natty Store
        </h2>
        <div className="trust-strip">
          <div className="trust-item">
            <span className="trust-icon">
              <ShieldIcon />
            </span>
            <div>
              <h3>Estoque reservado com segurança</h3>
              <p>Seus itens ficam reservados automaticamente durante o pagamento.</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">
              <PixIcon />
            </span>
            <div>
              <h3>Pagamento via Pix</h3>
              <p>Processado pelo Mercado Pago, com confirmação automática.</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">
              <ChatBubbleIcon />
            </span>
            <div>
              <h3>Suporte direto no chat</h3>
              <p>Fale com a administradora sempre que precisar de ajuda.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
