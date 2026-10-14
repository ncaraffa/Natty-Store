/* Logotipo tipográfico da Natty Store no tema streetwear: "NATTY" em
   grotesca pesada + "STORE" num adesivo amarelo levemente inclinado. */
export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-wordmark${compact ? " is-compact" : ""}`}>
      <span className="brand-wordmark__natty">Natty</span>
      <span className="brand-wordmark__store">Store</span>
    </span>
  );
}
