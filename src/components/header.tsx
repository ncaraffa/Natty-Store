"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";

const links: [string, string][] = [
  ["Início", "/"],
  ["MM2", "/mm2"],
  ["FTF", "/ftf"],
  ["Adopt Me", "/adopt-me"],
  ["Encomendas", "/encomendas"],
  ["Minhas compras", "/minhas-compras"],
  ["Avaliações", "/avaliacoes"],
  ["FAQ", "/faq"],
];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L20 8H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="21" r="1.4" fill="currentColor" />
      <circle cx="17" cy="21" r="1.4" fill="currentColor" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const [unread, setUnread] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = () =>
      fetch("/api/chat/unread")
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setUnread(Boolean(d.unread));
        })
        .catch(() => {});
    check();
    const id = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/is-admin")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setIsAdmin(Boolean(d.isAdmin));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", menuOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const supportBadge = unread && (
    <span className="nav-badge" role="status">
      Nova
    </span>
  );

  return (
    <>
      <header className={`header${scrolled ? " is-scrolled" : ""}`}>
      <Link className="brand" href="/" aria-label="Natty Store — página inicial">
        <span className="brand-mark" aria-hidden="true">
          N
        </span>
        Natty <span>Store</span>
      </Link>

      <nav className="desktop-nav" aria-label="Navegação principal">
        {links.map(([label, href]) => (
          <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
            {label}
          </Link>
        ))}
        <Link href="/chat" aria-current={isActive("/chat") ? "page" : undefined}>
          Suporte
          {supportBadge}
        </Link>
      </nav>

      <div className="actions">
        <Link href="/busca" aria-label="Buscar produtos">
          <SearchIcon />
          <span className="sr-only">Buscar</span>
        </Link>
        <Link href={isAdmin ? "/admin" : "/conta"}>{isAdmin ? "Painel admin" : "Minha conta"}</Link>
        <Link className="pill" href="/carrinho" aria-label={`Carrinho com ${count} ${count === 1 ? "item" : "itens"}`}>
          <CartIcon />
          Carrinho {count > 0 && <span>({count})</span>}
        </Link>
      </div>

      <button
        type="button"
        className="mobile-menu-toggle"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu-sheet"
        onClick={() => setMenuOpen(true)}
      >
        <MenuIcon />
        Menu
      </button>
      </header>

      {/* Irmão do <header>, nunca descendente: em Safari, position:fixed
          dentro de um ancestral position:sticky fica preso na caixa do
          sticky em vez de cobrir a viewport inteira. */}
      <div className="mobile-menu-panel" hidden={!menuOpen} onClick={() => setMenuOpen(false)}>
        <div
          className="mobile-menu-sheet"
          id="mobile-menu-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mobile-menu-head">
            <span className="brand">
              <span className="brand-mark" aria-hidden="true">
                N
              </span>
              Natty <span>Store</span>
            </span>
            <button
              type="button"
              className="mobile-menu-close"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Navegação mobile">
            {links.map(([label, href]) => (
              <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
                {label}
              </Link>
            ))}
            <Link href="/chat" aria-current={isActive("/chat") ? "page" : undefined}>
              Suporte
              {supportBadge}
            </Link>
          </nav>

          <div className="actions-stack">
            <Link href="/busca">Buscar produtos</Link>
            <Link href={isAdmin ? "/admin" : "/conta"}>{isAdmin ? "Painel admin" : "Minha conta"}</Link>
            <Link className="pill" href="/carrinho">
              Carrinho {count > 0 ? `(${count})` : ""}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
