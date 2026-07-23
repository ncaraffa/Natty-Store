import type { Product } from "@/types";

// DADOS MOCK PÚBLICOS: nomes, descrições, preços e estados abaixo são placeholders de desenvolvimento.
// Substituir somente por catálogo oficial validado pela Natty Store.
export const mockProducts: Product[] = [
  {id:"mock-mm2-1",slug:"item-demo-mm2",name:"Item demonstrativo MM2",category:"mm2",description:"Produto fictício para validar a experiência da loja.",priceCents:100,stockStatus:"available"},
  {id:"mock-ftf-1",slug:"item-demo-ftf",name:"Item demonstrativo FTF",category:"ftf",description:"Produto fictício para validar a experiência da loja.",priceCents:100,stockStatus:"limited"},
  {id:"mock-adopt-1",slug:"item-demo-adopt",name:"Item demonstrativo Adopt Me",category:"adopt-me",description:"Produto fictício para validar a experiência da loja.",priceCents:100,stockStatus:"unavailable"},
  {id:"mock-order-1",slug:"item-demo-preorder",name:"Item demonstrativo em pré-venda",category:"adopt-me",description:"Produto fictício sujeito a consulta de prazo e valor.",priceCents:100,stockStatus:"preorder"},
  {id:"mock-backorder-1",slug:"item-demo-backorder",name:"Item demonstrativo sob encomenda",category:"adopt-me",description:"Produto fictício sem estoque físico imediato.",priceCents:100,stockStatus:"backorder"}
];
export const publicStock: Record<Product["stockStatus"],string> = {available:"Disponível",limited:"Estoque limitado",unavailable:"Indisponível",preorder:"Pré-venda",backorder:"Disponível sob encomenda"};
export const money = (cents:number) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100);
