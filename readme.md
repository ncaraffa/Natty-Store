# Natty Store

Loja online de itens digitais para Roblox (MM2, FTF, Adopt Me), com catálogo, carrinho, checkout via Pix (Mercado Pago) e um painel administrativo para a dona da loja gerenciar produtos, estoque e pedidos.

Site em produção: https://natty-store-mu.vercel.app

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Supabase** (Postgres + Auth) como banco de dados e autenticação
- **Mercado Pago** (Checkout Transparente + webhook) para pagamento via Pix
- Deploy na **Vercel**

## Como funciona

O catálogo público (`/`, `/mm2`, `/ftf`, `/adopt-me`) lê a view `catalog_products` do Supabase, que expõe só o necessário para o cliente — nunca a quantidade real em estoque, só um status (`disponível`, `limitado`, `indisponível`, `pré-venda`, `sob encomenda`).

O carrinho vive no `localStorage` do navegador. No checkout, o pedido é criado no banco através da função `reserve_checkout` (Postgres, `security definer`), que reserva o estoque de forma atômica e idempotente antes de gerar a cobrança Pix — evita vender duas vezes o mesmo item em uma corrida entre dois clientes.

Quando o Mercado Pago confirma o pagamento, o webhook em `/api/webhooks/mercado-pago` valida a assinatura, consulta o pagamento na API deles (nunca confia só no payload recebido) e chama `consume_stock_reservation`, que marca o pedido como pago e baixa o estoque de verdade. Reservas que expiram sem pagamento voltam pro estoque via `expire_stock_reservations`, chamada por um cron job.

O painel admin (`/admin`) fica atrás de login por e-mail (Supabase Auth) restrito à lista em `ADMIN_EMAILS`. De lá dá pra:

- gerenciar o catálogo de produtos (`/admin/produtos`)
- controlar quantidade em estoque e política de venda (`/admin/estoque`)
- acompanhar e avançar o status dos pedidos (`/admin/pedidos`)

Todas essas telas usam a service role do Supabase pra escrever no banco, só depois de confirmar que quem está logado é o e-mail autorizado — o cliente comum nunca tem acesso direto a essas tabelas (RLS cuida disso).

## Estrutura

```
src/app/            rotas (App Router)
  admin/             painel administrativo (produtos, estoque, pedidos)
  api/               rotas de API (catálogo, checkout, webhook do Mercado Pago, cron)
src/components/     componentes de UI compartilhados
src/lib/            acesso a Supabase, integração com Mercado Pago, regras de catálogo
supabase/schema.sql  schema completo do banco (tabelas, RLS, funções de reserva de estoque)
scripts/             scripts utilitários (ex.: normalização das fotos do catálogo)
```

## Rodando localmente

Requer Node.js 20+.

```bash
npm install
copy .env.example .env.local   # preencher com suas próprias credenciais
npm run dev
```

Variáveis necessárias (ver `.env.example`): URL e chaves do Supabase, credenciais do Mercado Pago e a lista de e-mails com acesso ao `/admin`.

```bash
npm run lint
npm run typecheck
npm run build
```

## Banco de dados

O schema completo (tabelas, políticas de RLS e as funções de reserva/expiração/consumo de estoque) está em `supabase/schema.sql`, documentado com comentários explicando as decisões de segurança — por exemplo, por que as funções de escrita em estoque só podem ser chamadas pela `service_role`, nunca pelo navegador.

## Segurança

- Nenhuma chave sensível fica no código do cliente; tudo que precisa da service role roda em rotas server-side.
- O webhook do Mercado Pago sempre revalida o pagamento na API deles antes de liberar o pedido — um comprovante enviado pelo cliente nunca é aceito como confirmação.
- RLS no Postgres bloqueia leitura de estoque e pedidos por qualquer usuário não autenticado como admin.
