"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";

export type AdminKey =
  | "dashboard"
  | "produtos"
  | "estoque"
  | "pedidos"
  | "encomendas"
  | "cupons"
  | "banners"
  | "avaliacoes"
  | "chat"
  | "estatisticas";

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<AdminKey, ReactNode> = {
  dashboard: (
    <IconWrap>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </IconWrap>
  ),
  produtos: (
    <IconWrap>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </IconWrap>
  ),
  estoque: (
    <IconWrap>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </IconWrap>
  ),
  pedidos: (
    <IconWrap>
      <path d="M6 2h12v20l-3-1.5-2 1.5-1-1.5-2 1.5-1-1.5-3 1.5Z" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </IconWrap>
  ),
  encomendas: (
    <IconWrap>
      <path d="M12 2 3 6.5V12c0 5 3.8 8.6 9 10 5.2-1.4 9-5 9-10V6.5Z" />
      <path d="m9 12 2 2 4-4" />
    </IconWrap>
  ),
  cupons: (
    <IconWrap>
      <path d="M3 9a2.5 2.5 0 0 1 0 5v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2.5 2.5 0 0 1 0-5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z" />
      <path d="M12 5v2M12 17v2M12 10v3" />
    </IconWrap>
  ),
  banners: (
    <IconWrap>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m21 15-5-4-5 4-3-2-5 4" />
    </IconWrap>
  ),
  avaliacoes: (
    <IconWrap>
      <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7Z" />
    </IconWrap>
  ),
  chat: (
    <IconWrap>
      <path d="M4 4h16v11H8l-4 4Z" />
    </IconWrap>
  ),
  estatisticas: (
    <IconWrap>
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </IconWrap>
  ),
};

export function AdminIcon({ name }: { name: AdminKey }) {
  return <>{ICONS[name]}</>;
}

const MenuIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navItems: { key: AdminKey; label: string; href: string }[] = [
  { key: "dashboard", label: "Visão geral", href: "/admin" },
  { key: "produtos", label: "Produtos", href: "/admin/produtos" },
  { key: "estoque", label: "Estoque", href: "/admin/estoque" },
  { key: "pedidos", label: "Pedidos", href: "/admin/pedidos" },
  { key: "encomendas", label: "Encomendas", href: "/admin/encomendas" },
  { key: "cupons", label: "Cupons", href: "/admin/cupons" },
  { key: "banners", label: "Banners", href: "/admin/banners" },
  { key: "avaliacoes", label: "Avaliações", href: "/admin/avaliacoes" },
  { key: "chat", label: "Chat", href: "/admin/chat" },
  { key: "estatisticas", label: "Estatísticas", href: "/admin/estatisticas" },
];

export function AdminShell({ activeKey, children }: { activeKey: AdminKey; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const activeItem = navItems.find((item) => item.key === activeKey);

  function renderNav(onNavigate?: () => void) {
    return (
      <nav className="admin-nav" aria-label="Navegação do painel">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="admin-nav-link"
            aria-current={item.key === activeKey ? "page" : undefined}
            onClick={onNavigate}
          >
            <AdminIcon name={item.key} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-topbar-menu-btn"
          aria-label="Abrir menu do painel"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          {MenuIcon}
        </button>
        <div className="admin-topbar-title">
          <span>PAINEL</span>
          <strong>{activeItem?.label ?? "Administração"}</strong>
        </div>
        <Link href="/" className="admin-topbar-store">
          Ver loja
        </Link>
      </header>

      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-mark">N</span>
          <div>
            <strong>Natty Store</strong>
            <span>Painel administrativo</span>
          </div>
        </div>
        {renderNav()}
        <div className="admin-sidebar-foot">
          <Link href="/" className="button ghost sm">
            Ver loja
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {open && (
        <div className="admin-mobile-nav" role="dialog" aria-modal="true" aria-label="Menu do painel">
          <div className="admin-mobile-nav-backdrop" onClick={() => setOpen(false)} />
          <div className="admin-mobile-nav-sheet">
            <div className="admin-mobile-nav-head">
              <div className="admin-sidebar-brand" style={{ border: "none", padding: 0, marginBottom: 0 }}>
                <span className="admin-sidebar-mark">N</span>
                <div>
                  <strong>Natty Store</strong>
                  <span>Painel administrativo</span>
                </div>
              </div>
              <button type="button" className="admin-mobile-nav-close" aria-label="Fechar menu" onClick={() => setOpen(false)}>
                {CloseIcon}
              </button>
            </div>
            {renderNav(() => setOpen(false))}
            <div className="admin-mobile-nav-foot">
              <Link href="/" className="button ghost sm" onClick={() => setOpen(false)}>
                Ver loja
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}

      <div className="admin-content">{children}</div>
    </div>
  );
}
