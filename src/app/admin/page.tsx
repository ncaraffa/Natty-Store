import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function Admin() {
  await requireAdmin();

  return (
    <section>
      <span className="eyebrow">ADMINISTRAÇÃO</span>
      <h1>Painel administrativo</h1>
      <div className="notice">
        <b>Acesso protegido confirmado.</b>
        <p>As alterações abaixo são gravadas diretamente no banco de dados Supabase.</p>
      </div>
      <div className="grid">
        <article className="panel"><h2>Produtos</h2><p>Criar, editar e publicar catálogo.</p><Link href="/admin/produtos">Gerenciar produtos</Link></article>
        <article className="panel"><h2>Inventário</h2><p>Quantidade interna e movimentações.</p><Link href="/admin/estoque">Gerenciar estoque</Link></article>
        <article className="panel"><h2>Pedidos</h2><p>Pagamento e entrega auditáveis.</p><Link href="/admin/pedidos">Gerenciar pedidos</Link></article>
      </div>
    </section>
  );
}
