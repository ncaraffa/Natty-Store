import type { Metadata } from "next";
import Link from "next/link";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";
import "./accessibility.css";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageTransition } from "@/components/page-transition";
import { RouteCurtain } from "@/components/route-curtain";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <ScrollReveal />
          <RouteCurtain />
          <div className="grain-overlay" aria-hidden="true" />
          <a className="skip-link" href="#conteudo">
            Pular para o conteúdo
          </a>
          <Header />
          <main id="conteudo" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </main>
          <footer className="site-footer">
            <div className="footer-cta" data-reveal>
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

            <div className="site-footer-inner" data-reveal>
              <div className="footer-brand">
                <span className="brand">
                  <span className="brand-mark" aria-hidden="true">
                    N
                  </span>
                  Natty <span>Store</span>
                </span>
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
            </div>
            <div className="footer-bottom">
              <span>Natty Store — entrega e atendimento combinados com segurança.</span>
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
