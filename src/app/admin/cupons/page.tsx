import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import { AdminConfirmButton } from "@/components/admin-confirm-button";
import { createCoupon, updateCoupon, deleteCoupon } from "./actions";

export const dynamic = "force-dynamic";

type CouponRow = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  used_count: number;
  min_order_cents: number;
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

export default async function AdminCoupons() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("coupons")
    .select("id,code,discount_type,discount_value,active,starts_at,ends_at,max_uses,used_count,min_order_cents")
    .order("created_at", { ascending: false });

  const coupons = (data ?? []) as CouponRow[];

  return (
    <AdminShell activeKey="cupons">
      <section>
        <div className="admin-toolbar">
          <div>
            <span className="eyebrow">ADMINISTRAÇÃO</span>
            <h1>Cupons</h1>
          </div>
          <Link href="/admin" className="button ghost">
            Voltar
          </Link>
        </div>

        {error && <div className="warning">Falha ao carregar cupons: {error.message}</div>}

        <div className="panel">
          <h2>Novo cupom</h2>
          <form action={createCoupon} className="admin-new-form">
            <label>
              Código
              <input name="code" required maxLength={40} placeholder="BEMVINDO10" style={{ textTransform: "uppercase" }} />
            </label>
            <label>
              Tipo
              <select name="discount_type" defaultValue="percent">
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Valor fixo (centavos)</option>
              </select>
            </label>
            <label>
              Valor
              <input name="discount_value" required inputMode="numeric" placeholder="10" />
            </label>
            <label>
              Pedido mínimo (R$)
              <input name="min_order" inputMode="decimal" placeholder="0,00" />
            </label>
            <label>
              Limite de usos (opcional)
              <input name="max_uses" inputMode="numeric" />
            </label>
            <label>
              Início (opcional)
              <input name="starts_at" type="datetime-local" />
            </label>
            <label>
              Fim (opcional)
              <input name="ends_at" type="datetime-local" />
            </label>
            <label className="checkbox-field">
              <input type="checkbox" name="active" defaultChecked style={{ width: "auto", display: "inline-block" }} /> Ativo
            </label>
            <button>Criar cupom</button>
          </form>
        </div>

        <div className="list">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="cart-line admin-entity-card">
              <div className="admin-entity-head">
                <h3>{coupon.code}</h3>
                <span className={`badge ${coupon.active ? "badge-success" : "badge-neutral"}`}>
                  {coupon.used_count} usado{coupon.used_count === 1 ? "" : "s"}
                  {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                </span>
              </div>
              <form action={updateCoupon} className="admin-new-form">
                <input type="hidden" name="id" value={coupon.id} />
                <label>
                  Tipo
                  <select name="discount_type" defaultValue={coupon.discount_type}>
                    <option value="percent">Percentual (%)</option>
                    <option value="fixed">Valor fixo (centavos)</option>
                  </select>
                </label>
                <label>
                  Valor
                  <input name="discount_value" defaultValue={coupon.discount_value} required inputMode="numeric" />
                </label>
                <label>
                  Pedido mínimo (R$)
                  <input name="min_order" defaultValue={(coupon.min_order_cents / 100).toFixed(2)} inputMode="decimal" />
                </label>
                <label>
                  Limite de usos
                  <input name="max_uses" defaultValue={coupon.max_uses ?? ""} inputMode="numeric" />
                </label>
                <label>
                  Início
                  <input name="starts_at" type="datetime-local" defaultValue={toLocalInput(coupon.starts_at)} />
                </label>
                <label>
                  Fim
                  <input name="ends_at" type="datetime-local" defaultValue={toLocalInput(coupon.ends_at)} />
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={coupon.active}
                    style={{ width: "auto", display: "inline-block" }}
                  />{" "}
                  Ativo
                </label>
                <button>Salvar</button>
              </form>
              <form action={deleteCoupon} className="admin-entity-actions">
                <input type="hidden" name="id" value={coupon.id} />
                <AdminConfirmButton
                  className="link-button"
                  confirmMessage={`Remover o cupom ${coupon.code}? Essa ação não pode ser desfeita.`}
                >
                  Remover cupom
                </AdminConfirmButton>
              </form>
            </div>
          ))}
          {coupons.length === 0 && !error && <div className="empty">Nenhum cupom cadastrado ainda.</div>}
        </div>
      </section>
    </AdminShell>
  );
}
