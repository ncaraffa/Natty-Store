import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell, AdminIcon, type AdminKey } from "@/components/admin-shell";

const sections: { key: AdminKey; title: string; description: string; href: string; cta: string }[] = [
  { key: "produtos", title: "Produtos", description: "Criar, editar e publicar catálogo.", href: "/admin/produtos", cta: "Gerenciar produtos" },
  { key: "estoque", title: "Inventário", description: "Quantidade interna e movimentações.", href: "/admin/estoque", cta: "Gerenciar estoque" },
  { key: "pedidos", title: "Pedidos", description: "Pagamento e entrega auditáveis.", href: "/admin/pedidos", cta: "Gerenciar pedidos" },
  { key: "avaliacoes", title: "Avaliações", description: "Ver e responder avaliações de clientes.", href: "/admin/avaliacoes", cta: "Gerenciar avaliações" },
  { key: "banners", title: "Banners", description: "Promoções, novidades, avisos e eventos.", href: "/admin/banners", cta: "Gerenciar banners" },
  { key: "cupons", title: "Cupons", description: "Cupons de desconto por percentual ou valor fixo.", href: "/admin/cupons", cta: "Gerenciar cupons" },
  { key: "estatisticas", title: "Estatísticas", description: "Vendas, pedidos e produtos mais vendidos.", href: "/admin/estatisticas", cta: "Ver estatísticas" },
  { key: "chat", title: "Chat", description: "Converse com clientes, entregue itens e dê suporte.", href: "/admin/chat", cta: "Abrir conversas" },
];

export default async function Admin() {
  await requireAdmin();

  return (
    <AdminShell activeKey="dashboard">
      <section>
        <span className="eyebrow">ADMINISTRAÇÃO</span>
        <h1>Painel administrativo</h1>
        <div className="notice">
          <b>Acesso protegido confirmado.</b>
          <p>As alterações abaixo são gravadas diretamente no banco de dados Supabase.</p>
        </div>
        <div className="admin-dashboard-grid">
          {sections.map((section) => (
            <article key={section.key} className="admin-dashboard-card">
              <span className="admin-dashboard-card-icon">
                <AdminIcon name={section.key} />
              </span>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              <Link href={section.href} className="admin-dashboard-card-link">
                {section.cta}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
