import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type ConversationRow = {
  id: string;
  last_message_at: string | null;
  unread_by_admin: boolean;
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

export default async function AdminChat() {
  const { db } = await requireAdmin();

  const { data, error } = await db
    .from("conversations")
    .select("id,last_message_at,unread_by_admin,customer_id,customers(roblox_nick,contact)")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const conversations = (data ?? []) as unknown as ConversationRow[];

  return (
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

      <div className="list">
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/admin/chat/${conversation.id}`}
            className="cart-line"
            style={{ textDecoration: "none" }}
          >
            <div>
              <b>{conversation.customers?.roblox_nick ?? "Cliente"}</b>
              <div className="muted" style={{ fontSize: 12 }}>
                {conversation.customers?.contact} · {formatDate(conversation.last_message_at)}
              </div>
            </div>
            {conversation.unread_by_admin && <span className="badge">Nova mensagem</span>}
          </Link>
        ))}
        {conversations.length === 0 && !error && <div className="empty">Nenhuma conversa ainda.</div>}
      </div>
    </section>
  );
}
