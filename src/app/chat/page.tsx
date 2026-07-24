import { serverSupabase } from "@/lib/supabase/server";
import {
  ensureConversation,
  sendCustomerMessage,
  markConversationReadByCustomer,
  closeConversationByCustomer,
} from "./actions";
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

function ChatEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h16v11H9l-4 4V5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function Chat() {
  const supabase = await serverSupabase();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!supabase || !authData.user) {
    return (
      <section className="narrow">
        <span className="eyebrow">Suporte</span>
        <h1>Chat com a loja</h1>
        <p>Entre na sua conta para conversar com a administradora da Natty Store.</p>
      </section>
    );
  }

  const conversationId = await ensureConversation();
  await markConversationReadByCustomer(conversationId);

  const [{ data }, { data: conversationData }] = await Promise.all([
    supabase
      .from("chat_messages")
      .select("id,sender_role,body,image_url,created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200),
    supabase.from("conversations").select("status").eq("id", conversationId).maybeSingle(),
  ]);

  const messages = (data ?? []) as MessageRow[];
  const isClosed = conversationData?.status === "closed";

  return (
    <section className="narrow">
      <ChatAutoRefresh />
      <span className="eyebrow">Suporte</span>
      <h1>Chat com a loja</h1>
      <p>Converse diretamente com a administradora sobre seu pedido, dúvidas ou suporte.</p>

      <div className="chat-shell">
        {isClosed && (
          <div className="chat-status">
            <span className="muted">
              Esta conversa foi encerrada. Envie uma nova mensagem a qualquer momento para reabrir.
            </span>
          </div>
        )}

        <div className="chat-thread" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <ChatEmptyIcon />
              <p>Nenhuma mensagem ainda. Diga oi!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`chat-bubble-row ${message.sender_role === "customer" ? "is-customer" : "is-admin"}`}
              >
                <div className="chat-bubble">
                  <span className="chat-bubble__meta">
                    {message.sender_role === "customer" ? "Você" : "Natty Store"} · {formatDate(message.created_at)}
                  </span>
                  {message.body && <p>{message.body}</p>}
                  {message.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={message.image_url} alt="Imagem enviada no chat" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <form action={sendCustomerMessage} encType="multipart/form-data" className="chat-composer">
          <input type="hidden" name="conversation_id" value={conversationId} />
          <label>
            Mensagem
            <textarea name="body" rows={2} maxLength={4000} placeholder="Escreva sua mensagem..." />
          </label>
          <div className="form-actions">
            <label style={{ flex: 1, minWidth: 200 }}>
              Imagem ou comprovante (opcional)
              <input name="image" type="file" accept="image/*" />
            </label>
            <button style={{ alignSelf: "end" }}>Enviar</button>
          </div>
        </form>
      </div>

      {!isClosed && (
        <form action={closeConversationByCustomer} className="chat-close-form">
          <input type="hidden" name="conversation_id" value={conversationId} />
          <button type="submit" className="link-button">
            Encerrar conversa
          </button>
        </form>
      )}
    </section>
  );
}
