import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { replyToConversation } from "../actions";
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
      .select("id,customers(roblox_nick,contact)")
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

  return (
    <section>
      <ChatAutoRefresh />
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">CHAT</span>
          <h1>{customerInfo?.roblox_nick ?? "Cliente"}</h1>
          <p>{customerInfo?.contact}</p>
        </div>
        <Link href="/admin/chat" className="button ghost">
          Voltar
        </Link>
      </div>

      <div className="panel" style={{ maxHeight: 480, overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div className="empty">Nenhuma mensagem ainda.</div>
        ) : (
          <div className="list">
            {messages.map((message) => (
              <div
                key={message.id}
                className="cart-line"
                style={{
                  flexDirection: "column",
                  alignItems: message.sender_role === "admin" ? "flex-end" : "flex-start",
                  background: message.sender_role === "admin" ? "#f0e9fa" : "#fff",
                }}
              >
                <strong style={{ fontSize: 12 }}>
                  {message.sender_role === "admin" ? "Natty Store" : customerInfo?.roblox_nick ?? "Cliente"} ·{" "}
                  {formatDate(message.created_at)}
                </strong>
                {message.body && <p>{message.body}</p>}
                {message.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.image_url}
                    alt="Imagem enviada no chat"
                    style={{ maxWidth: 240, borderRadius: 8, marginTop: 6 }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <form action={replyToConversation} encType="multipart/form-data">
        <input type="hidden" name="conversation_id" value={id} />
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
  );
}
