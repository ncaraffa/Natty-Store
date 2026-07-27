import Link from "next/link";

function CompassIcon() {
  return (
    <svg className="empty-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M14.8 9.2l-1.6 4.4a1 1 0 0 1-.6.6l-4.4 1.6 1.6-4.4a1 1 0 0 1 .6-.6l4.4-1.6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NotFound() {
  return (
    <section>
      <div className="empty" style={{ marginTop: "var(--space-12)" }}>
        <CompassIcon />
        <h2>Essa página se perdeu no inventário</h2>
        <p>
          O link pode ter mudado ou o item já não existe mais. Volte para a
          loja ou explore o catálogo completo.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/">
            Voltar para a loja
          </Link>
          <Link className="button ghost" href="/busca">
            Buscar produtos
          </Link>
        </div>
      </div>
    </section>
  );
}
