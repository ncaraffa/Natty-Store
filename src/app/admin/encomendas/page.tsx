import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import { updateCustomRequestStatus } from "./actions";

export const dynamic = "force-dynamic";

type CustomRequestRow = {
  id: string;
  name: string;
  roblox_nick: string;
  contact: string;
  game: string;
  request: string;
  status: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  reviewing: "Em análise",
  quoted: "Orçado",
  accepted: "Aceito",
  declined: "Recusado",
  completed: "Concluído",
};

const statusBadgeClass: Record<string, string> = {
  new: "badge-info",
  reviewing: "badge-warning",
  quoted: "badge-warning",
  accepted: "badge-info",
  declined: "badge-danger",
  completed: "badge-success",
};

const gameLabels: Record<string, string> = {
  mm2: "MM2",
  ftf: "FTF",
  "adopt-me": "Adopt Me",
  other: "Outro",
};

const terminalStatuses = new Set(["declined", "completed"]);

const nextStatusOptions: Record<string, string[]> = {
  new: ["reviewing", "quoted", "accepted", "declined"],
  reviewing: ["quoted", "accepted", "declined"],
  quoted: ["accepted", "declined"],
  accepted: ["completed", "declined"],
};

export default async function AdminCustomRequests() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("custom_requests")
    .select("id,name,roblox_nick,contact,game,request,status,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const requests = (data ?? []) as unknown as CustomRequestRow[];

  return (
    <AdminShell activeKey="encomendas">
      <section>
        <div className="admin-toolbar">
          <div>
            <span className="eyebrow">ADMINISTRAÇÃO</span>
            <h1>Encomendas</h1>
          </div>
          <Link href="/admin" className="button ghost">
            Voltar
          </Link>
        </div>

        {error && <div className="warning">Falha ao carregar encomendas: {error.message}</div>}

        <div className="list">
          {requests.map((item) => {
            const options = nextStatusOptions[item.status] ?? [];

            return (
              <div key={item.id} className="cart-line admin-entity-card">
                <div className="admin-entity-head">
                  <div>
                    <h3>{item.name}</h3>
                    <div className="admin-entity-meta">Nick Roblox: {item.roblox_nick}</div>
                    <div className="admin-entity-meta">Contato: {item.contact}</div>
                    <div className="admin-entity-meta">{new Date(item.created_at).toLocaleString("pt-BR")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="admin-badge-row" style={{ justifyContent: "flex-end" }}>
                      <span className="badge badge-neutral">{gameLabels[item.game] ?? item.game}</span>
                      <span className={`badge ${statusBadgeClass[item.status] ?? "badge-neutral"}`}>
                        {statusLabels[item.status] ?? item.status}
                      </span>
                    </div>
                  </div>
                </div>

                <ul className="admin-entity-items">
                  <li>
                    <span>{item.request}</span>
                  </li>
                </ul>

                {!terminalStatuses.has(item.status) && options.length > 0 && (
                  <form action={updateCustomRequestStatus} className="admin-entity-form">
                    <input type="hidden" name="request_id" value={item.id} />
                    <select name="status" defaultValue={options[0]}>
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {statusLabels[option]}
                        </option>
                      ))}
                    </select>
                    <button>Atualizar status</button>
                  </form>
                )}
              </div>
            );
          })}
          {requests.length === 0 && !error && <div className="empty">Nenhuma encomenda ainda.</div>}
        </div>
      </section>
    </AdminShell>
  );
}
