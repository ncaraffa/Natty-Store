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

function PlusIcon() {
  return (
    <svg className="accordion-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Faq() {
  return (
    <section className="narrow">
      <span className="eyebrow">Ajuda</span>
      <h1>Perguntas frequentes</h1>
      <p>Tudo o que você precisa saber antes de comprar na Natty Store.</p>
      <div className="accordion">
        {faqItems.map((item, index) => (
          <details className="accordion-item" key={item.question} open={index === 0}>
            <summary>
              {item.question}
              <PlusIcon />
            </summary>
            <div className="accordion-body">
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
