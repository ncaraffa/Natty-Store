import type { Product } from "@/types";

export const publicStock: Record<Product["stockStatus"], string> = {
  available: "Disponível",
  limited: "Estoque limitado",
  unavailable: "Indisponível",
  preorder: "Pré-venda",
  backorder: "Disponível sob encomenda",
};

export const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
