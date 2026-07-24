import type { Metadata } from "next";
import Link from "next/link";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import "./accessibility.css";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
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
    <html lang="pt-BR" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <CartProvider>
          <a className="skip-link" href="#conteudo">
            Pular para o conteúdo
          </a>
          <Header />
          <main id="conteudo" tabIndex={-1}>
            {children}
          </main>
          <footer className="site-footer">
            <div className="site-footer-inner">
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
              <div className="footer-col">
                <h3>Loja segura</h3>
                <ul>
                  <li>Pagamento via Pix (Mercado Pago)</li>
                  <li>Reserva automática de estoque</li>
                  <li>Suporte humano pelo chat</li>
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
              <Link href="/admin">Admin</Link>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
