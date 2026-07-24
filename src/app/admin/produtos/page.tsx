import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import { createProduct, updateProduct } from "./actions";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  image_url: string | null;
  badge: string | null;
  active: boolean;
};

const badgeOptions = [
  ["", "Sem selo"],
  ["new", "Novo"],
  ["promo", "Promoção"],
  ["bestseller", "Mais vendido"],
  ["featured", "Destaque"],
] as const;

function toReais(cents: number) {
  return (cents / 100).toFixed(2);
}

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
          <form action={createProduct} className="admin-new-form" encType="multipart/form-data">
            <label>
              Nome
              <input required name="name" maxLength={120} />
            </label>
            <label>
              Categoria
              <select required name="category" defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                <option value="mm2">MM2</option>
                <option value="ftf">FTF</option>
                <option value="adopt-me">Adopt Me</option>
              </select>
            </label>
            <label>
              Preço (R$)
              <input required name="price" inputMode="decimal" placeholder="1,99" />
            </label>
            <label>
              Imagem (arquivo)
              <input name="image_file" type="file" accept="image/*" />
            </label>
            <label>
              Imagem (URL, opcional se enviar arquivo)
              <input name="image_url" placeholder="https://..." />
            </label>
            <label>
              Selo
              <select name="badge" defaultValue="">
                {badgeOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              Descrição
              <textarea name="description" rows={2} maxLength={2000} />
            </label>
            <button>Criar produto</button>
          </form>
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
                    <form
                      action={updateProduct}
                      className="admin-row-form"
                      encType="multipart/form-data"
                    >
                      <input type="hidden" name="id" value={product.id} />
                      <div>
                        <div className="admin-cell">
                          <span className="admin-cell-label">Nome</span>
                          <input name="name" defaultValue={product.name} maxLength={120} required />
                        </div>
                        <div className="admin-cell">
                          <span className="admin-cell-label">Categoria</span>
                          <select name="category" defaultValue={product.category}>
                            <option value="mm2">MM2</option>
                            <option value="ftf">FTF</option>
                            <option value="adopt-me">Adopt Me</option>
                          </select>
                        </div>
                        <div className="admin-cell">
                          <span className="admin-cell-label">Preço (R$)</span>
                          <input name="price" defaultValue={toReais(product.price_cents)} inputMode="decimal" />
                        </div>
                        <div className="admin-cell">
                          <span className="admin-cell-label">Imagem</span>
                          {product.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt="" className="admin-cell-thumb" />
                          )}
                          <input name="image_file" type="file" accept="image/*" style={{ maxWidth: 160 }} />
                          <input name="image_url" defaultValue={product.image_url ?? ""} placeholder="ou cole uma URL" style={{ marginTop: 4 }} />
                        </div>
                        <div className="admin-cell">
                          <span className="admin-cell-label">Descrição</span>
                          <textarea
                            name="description"
                            defaultValue={product.description}
                            rows={2}
                            maxLength={2000}
                            style={{ minWidth: "180px" }}
                          />
                        </div>
                        <div className="admin-cell">
                          <span className="admin-cell-label">Selo</span>
                          <select name="badge" defaultValue={product.badge ?? ""}>
                            {badgeOptions.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-cell">
                          <span className="admin-cell-label">Ativo</span>
                          <input type="checkbox" name="active" defaultChecked={product.active} aria-label="Produto ativo" />
                        </div>
                        <div className="admin-cell admin-cell-slug">
                          <span className="admin-cell-label">Slug</span>
                          {product.slug}
                        </div>
                        <div className="admin-cell">
                          <span className="admin-cell-label">&nbsp;</span>
                          <button>Salvar</button>
                        </div>
                      </div>
                    </form>
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
