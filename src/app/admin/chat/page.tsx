import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";

export const dynamic = "force-dynamic";

type ConversationRow = {
  id: string;
  last_message_at: string | null;
  unread_by_admin: boolean;
  status: string;
  customer_id: string;
  customers: { roblox_nick: string; contact: string } | null;
};

function formatDate(value: string | null) {
  if (!value) return "Sem mensagens";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Campo_Grande",
  }).format(date);
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export default async function AdminChat() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("conversations")
    .select("id,last_message_at,unread_by_admin,status,customer_id,customers(roblox_nick,contact)")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const conversations = (data ?? []) as unknown as ConversationRow[];

  return (
    <AdminShell activeKey="chat">
      <section>
        <div className="admin-toolbar">
          <div>
            <span className="eyebrow">ADMINISTRAÇÃO</span>
            <h1>Chat com clientes</h1>
          </div>
          <Link href="/admin" className="button ghost">
            Voltar
          </Link>
        </div>

        {error && <div className="warning">Falha ao carregar conversas: {error.message}</div>}

        <div className="admin-chat-list">
          {conversations.map((conversation) => {
            const nick = conversation.customers?.roblox_nick ?? "Cliente";
            return (
              <Link
                key={conversation.id}
                href={`/admin/chat/${conversation.id}`}
                className={`cart-line admin-chat-list-item${conversation.unread_by_admin ? " is-unread" : ""}`}
              >
                <span className="admin-chat-avatar" aria-hidden="true">
                  {initials(nick)}
                </span>
                <div className="admin-chat-info">
                  <strong>{nick}</strong>
                  <span>
                    {conversation.customers?.contact} · {formatDate(conversation.last_message_at)}
                  </span>
                </div>
                <div className="admin-badge-row">
                  {conversation.unread_by_admin && (
                    <span className="badge badge-info">
                      <span className="admin-unread-dot" aria-hidden="true" /> Nova mensagem
                    </span>
                  )}
                  {conversation.status === "closed" && <span className="badge badge-neutral">Encerrada</span>}
                </div>
              </Link>
            );
          })}
          {conversations.length === 0 && !error && <div className="empty">Nenhuma conversa ainda.</div>}
        </div>
      </section>
    </AdminShell>
  );
}
