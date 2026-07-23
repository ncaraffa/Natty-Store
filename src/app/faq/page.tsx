const faqItems: { question: string; answer: string }[] = [
  {
    question: "Como funciona a compra na Natty Store?",
    answer:
      "Escolha os itens no catálogo, adicione ao carrinho e finalize o checkout com seus dados. Após a confirmação do pagamento, o item é entregue conforme combinado.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer: "Pagamentos são processados via Pix, através do Mercado Pago.",
  },
  {
    question: "Quanto tempo leva a entrega?",
    answer:
      "A entrega costuma ser feita logo após a confirmação do pagamento. Em caso de encomenda, o prazo é combinado diretamente com a administradora.",
  },
  {
    question: "Como faço uma encomenda de um item que não está no catálogo?",
    answer:
      'Use a página "Encomendas" no menu para solicitar itens sob consulta.',
  },
  {
    question: "Posso acompanhar meus pedidos?",
    answer:
      'Sim. Entre na sua conta pela opção "Minha conta" e consulte o histórico completo de pedidos, com itens, valores, datas e status.',
  },
  {
    question: "O que fazer se tiver algum problema com meu pedido?",
    answer:
      "Entre em contato diretamente com a administradora da loja pelos canais informados no rodapé do site.",
  },
];

export default function Faq() {
  return (
    <section className="narrow">
      <span className="eyebrow">AJUDA</span>
      <h1>Perguntas frequentes</h1>
      <div className="list">
        {faqItems.map((item) => (
          <article className="panel" key={item.question}>
            <h2>{item.question}</h2>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
