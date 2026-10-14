import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Inter, Permanent_Marker, Titan_One } from "next/font/google";
import "./globals.css";
import "./accessibility.css";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BrandWordmark } from "@/components/brand-wordmark";
import { Smiley, Sparkle } from "@/components/doodles";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const titan = Titan_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-titan",
  display: "swap",
});

const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Natty Store",
  description: "Itens digitais para seus jogos favoritos",
  manifest: "/manifest.json",
};

const footerLinks = {
  loja: [
    ["MM2", "/mm2"],
    ["FTF", "/ftf"],
    ["Adopt Me", "/adopt-me"],
    ["Encomendas", "/encomendas"],
  ],
  ajuda: [
    ["Perguntas frequentes", "/faq"],
    ["Chat com a loja", "/chat"],
    ["Avaliações", "/avaliacoes"],
    ["Minhas compras", "/minhas-compras"],
    ["Minha conta", "/conta"],
  ],
};

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.4 2.2 1.8 3.7 4 4v3.2c-1.5 0-2.9-.4-4-1.1v6.4A6.2 6.2 0 1 1 10.4 9.3v3.3a3 3 0 1 0 3 3V3h3.2z" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${inter.variable} ${titan.variable} ${marker.variable}`}
    >
      <body>
        <CartProvider>
          <ScrollReveal />
          <a className="skip-link" href="#conteudo">
            Pular para o conteúdo
          </a>
          <Header />
          <main id="conteudo" tabIndex={-1}>
            {children}
          </main>
          <footer className="site-footer">
            <div className="footer-cta">
              <Sparkle className="footer-cta__sparkle" />
              <div>
                <span className="eyebrow">Fale com a gente</span>
                <h2>Dúvidas antes de comprar?</h2>
                <p>Suporte humano direto no chat ou pelo TikTok da loja.</p>
              </div>
              <div className="footer-cta-actions">
                <Link className="button" href="/chat">
                  Abrir chat
                </Link>
                <a
                  className="button ghost"
                  href="https://www.tiktok.com/@storenatty"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @storenatty no TikTok
                </a>
              </div>
            </div>

            <div className="site-footer-inner">
              <div className="footer-brand">
                <BrandWordmark />
                <p>
                  Itens digitais para MM2, Flee the Facility e Adopt Me, com
                  entrega combinada e suporte direto no chat.
                </p>
                <ul className="footer-trust-list">
                  <li>Pagamento via Pix (Mercado Pago)</li>
                  <li>Reserva automática de estoque</li>
                  <li>Suporte humano pelo chat</li>
                </ul>
              </div>
              <div className="footer-col">
                <h3>Loja</h3>
                <ul>
                  {footerLinks.loja.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="footer-col">
                <h3>Ajuda</h3>
                <ul>
                  {footerLinks.ajuda.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="footer-col footer-social">
                <h3>Siga a loja</h3>
                <a
                  className="footer-social__link"
                  href="https://www.tiktok.com/@storenatty"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="footer-social__icon">
                    <TikTokIcon />
                  </span>
                  <span>
                    TikTok para contato: <strong>@storenatty</strong>
                  </span>
                </a>
                <p className="footer-social__note">
                  Boa vibe, item raro <Smiley className="footer-social__smiley" />
                </p>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© {year} Natty Store. Todos os direitos reservados.</span>
              <span className="footer-credit">
                Desenvolvido por{" "}
                <a
                  href="https://github.com/ncaraffa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nicolas Caraffa
                </a>
              </span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
