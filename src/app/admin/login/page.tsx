import { AuthPanel } from "@/components/auth-panel";

export default function AdminLogin() {
  return (
    <section className="admin-login-page">
      <div className="admin-login-card narrow">
        <div className="admin-login-lock" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <span className="eyebrow">ACESSO RESTRITO</span>
        <h1>Administração Natty Store</h1>
        <div className="panel">
          <AuthPanel title="Entrar como administradora" next="/admin" />
        </div>
        <p className="muted">Somente e-mails autorizados no servidor conseguem abrir o painel.</p>
      </div>
    </section>
  );
}
