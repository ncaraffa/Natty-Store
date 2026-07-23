import { AuthPanel } from "@/components/auth-panel";

export default function AdminLogin() {
  return (
    <section className="narrow">
      <span className="eyebrow">ACESSO RESTRITO</span>
      <h1>Administração Natty Store</h1>
      <div className="panel">
        <AuthPanel title="Entrar como administradora" next="/admin" />
      </div>
      <p className="muted">Somente e-mails autorizados no servidor conseguem abrir o painel.</p>
    </section>
  );
}
