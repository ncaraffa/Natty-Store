import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import { NewProductForm } from "./new-product-form";
import { ProductRowForm } from "./product-row-form";
import type { ProductRow } from "./shared";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("products")
    .select("id,slug,name,description,category,price_cents,image_url,badge,active")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as ProductRow[];

  return (
    <AdminShell activeKey="produtos">
      <section>
        <div className="admin-toolbar">
          <div>
            <span className="eyebrow">ADMINISTRAÇÃO</span>
            <h1>Produtos</h1>
          </div>
          <Link href="/admin" className="button ghost">
            Voltar
          </Link>
        </div>

        {error && <div className="warning">Falha ao carregar produtos: {error.message}</div>}

        <div className="panel">
          <h2>Novo produto</h2>
          <p className="field-help" style={{ marginTop: -8, marginBottom: 8 }}>
            Preencha os campos abaixo para publicar um novo item no catálogo.
          </p>
          <NewProductForm />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço (R$)</th>
                <th>Imagem</th>
                <th>Mudar descrição</th>
                <th>Selo</th>
                <th>Ativo</th>
                <th>Slug</th>
                <th>Salvar</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td colSpan={9} style={{ padding: 0 }}>
                    <ProductRowForm product={product} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && !error && (
                <tr>
                  <td colSpan={9} className="admin-table-empty">
                    Nenhum produto cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
