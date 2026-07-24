export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  image_url: string | null;
  badge: string | null;
  active: boolean;
};

export const badgeOptions = [
  ["", "Sem selo"],
  ["new", "Novo"],
  ["promo", "Promoção"],
  ["bestseller", "Mais vendido"],
  ["featured", "Destaque"],
] as const;

export function toReais(cents: number) {
  return (cents / 100).toFixed(2);
}
