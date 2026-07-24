import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";
import { SignOutButton } from "@/components/sign-out-button";
import { SwitchAccountButton } from "@/components/switch-account-button";
import { serverSupabase } from "@/lib/supabase/server";

export default async function Account() {
  const supabase = await serverSupabase();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  return (
    <section className="narrow">
      <span className="eyebrow">Área do cliente</span>
      <h1>Minha conta</h1>

      <article className="panel account-card">
        {authData.user ? (
          <>
            <h2>Acesso confirmado</h2>
            <span className="account-user-email">{authData.user.email}</span>
            <p>
              Esta conta mostra somente pedidos vinculados ao seu usuário
              autenticado.
            </p>
            <div className="account-actions">
              <Link className="button" href="/minhas-compras">
                Minhas compras
              </Link>
              <SignOutButton />
              <SwitchAccountButton />
            </div>
          </>
        ) : (
          <AuthPanel title="Entrar ou criar conta por e-mail" />
        )}
      </article>
    </section>
  );
}
