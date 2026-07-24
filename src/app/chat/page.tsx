import { serverSupabase } from "@/lib/supabase/server";
import { ensureConversation, sendCustomerMessage, markConversationReadByCustomer } from "./actions";
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

export default async function Chat() {
  const supabase = await serverSupabase();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!supabase || !authData.user) {
    return (
      <section className="narrow">
        <span className="eyebrow">SUPORTE</span>
        <h1>Chat com a loja</h1>
        <p>Entre na sua conta para conversar com a administradora da Natty Store.</p>
      </section>
    );
  }

  const conversationId = await ensureConversation();
  await markConversationReadByCustomer(conversationId);

  const { data } = await supabase
    .from("chat_messages")
    .select("id,sender_role,body,image_url,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);

  const messages = (data ?? []) as MessageRow[];

  return (
    <section className="narrow">
      <ChatAutoRefresh />
      <span className="eyebrow">SUPORTE</span>
      <h1>Chat com a loja</h1>
      <p>Converse diretamente com a administradora sobre seu pedido, dúvidas ou suporte.</p>

      <div className="panel" style={{ maxHeight: 480, overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div className="empty">Nenhuma mensagem ainda. Diga oi!</div>
        ) : (
          <div className="list">
            {messages.map((message) => (
              <div
                key={message.id}
                className="cart-line"
                style={{
                  flexDirection: "column",
                  alignItems: message.sender_role === "customer" ? "flex-end" : "flex-start",
                  background: message.sender_role === "customer" ? "#f0e9fa" : "#fff",
                }}
              >
                <strong style={{ fontSize: 12 }}>
                  {message.sender_role === "customer" ? "Você" : "Natty Store"} · {formatDate(message.created_at)}
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

      <form action={sendCustomerMessage} encType="multipart/form-data">
        <input type="hidden" name="conversation_id" value={conversationId} />
        <label>
          Mensagem
          <textarea name="body" rows={3} maxLength={4000} placeholder="Escreva sua mensagem..." />
        </label>
        <label>
          Imagem ou comprovante (opcional)
          <input name="image" type="file" accept="image/*" />
        </label>
        <button>Enviar</button>
      </form>
    </section>
  );
}
