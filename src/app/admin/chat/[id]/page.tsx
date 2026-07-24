import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import { replyToConversation, setConversationStatus } from "../actions";
import { ChatAutoRefresh } from "@/components/chat-auto-refresh";

export const dynamic = "force-dynamic";

type MessageRow = {
  id: string;
  sender_role: "customer" | "admin";
  body: string | null;
  image_url: string | null;
  created_at: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Campo_Grande",
  }).format(date);
}

export default async function AdminChatConversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db } = await requireAdmin();

  const [conversationResult, messagesResult] = await Promise.all([
    db
      .from("conversations")
      .select("id,status,customers(roblox_nick,contact)")
      .eq("id", id)
      .single(),
    db
      .from("chat_messages")
      .select("id,sender_role,body,image_url,created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  await db.from("conversations").update({ unread_by_admin: false }).eq("id", id);

  const customer = conversationResult.data?.customers as
    | { roblox_nick: string; contact: string }
    | { roblox_nick: string; contact: string }[]
    | null;
  const customerInfo = Array.isArray(customer) ? customer[0] : customer;
  const messages = (messagesResult.data ?? []) as MessageRow[];
  const status = conversationResult.data?.status ?? "open";

  return (
    <AdminShell activeKey="chat">
      <section>
        <ChatAutoRefresh />
        <div className="admin-toolbar">
          <div>
            <span className="eyebrow">CHAT</span>
            <h1>{customerInfo?.roblox_nick ?? "Cliente"}</h1>
            <p className="admin-entity-meta">
              {customerInfo?.contact} ·{" "}
              <span className={`badge ${status === "closed" ? "badge-neutral" : "badge-success"}`}>
                {status === "closed" ? "Encerrada" : "Aberta"}
              </span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <form action={setConversationStatus}>
              <input type="hidden" name="conversation_id" value={id} />
              <input type="hidden" name="status" value={status === "closed" ? "open" : "closed"} />
              <button type="submit" className="button ghost">
                {status === "closed" ? "Reabrir conversa" : "Encerrar conversa"}
              </button>
            </form>
            <Link href="/admin/chat" className="button ghost">
              Voltar
            </Link>
          </div>
        </div>

        <div className="panel admin-conversation-panel">
          {messages.length === 0 ? (
            <div className="empty">Nenhuma mensagem ainda.</div>
          ) : (
            <div className="admin-chat-thread">
              {messages.map((message) => (
                <div key={message.id} className={`admin-chat-bubble-row${message.sender_role === "admin" ? " is-admin" : ""}`}>
                  <div className="admin-chat-bubble">
                    <strong className="admin-chat-bubble-meta">
                      {message.sender_role === "admin" ? "Natty Store" : customerInfo?.roblox_nick ?? "Cliente"} ·{" "}
                      {formatDate(message.created_at)}
                    </strong>
                    {message.body && <p>{message.body}</p>}
                    {message.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={message.image_url} alt="Imagem enviada no chat" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form action={replyToConversation} encType="multipart/form-data" className="admin-chat-composer">
          <label>
            Resposta
            <textarea name="body" rows={3} maxLength={4000} placeholder="Responder ao cliente..." />
          </label>
          <label>
            Imagem (opcional)
            <input name="image" type="file" accept="image/*" />
          </label>
          <button>Enviar</button>
        </form>
      </section>
    </AdminShell>
  );
}
