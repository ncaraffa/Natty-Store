# Redesign v3 — resumo específico das mudanças

Terceira passada de polimento visual sobre a branch `redesign/frontend-premium2`
(que já continha duas rodadas anteriores de redesign). Este ciclo focou no que
ainda faltava para um acabamento "production-grade": **movimento com propósito**
(reveal-on-scroll, feedback de interação) e pequenos ajustes de tipografia e
timing. Nenhuma cor de marca, rota de API, lógica de negócio ou schema do
Supabase foi alterada — só componentes de UI, CSS e um novo componente client
puramente visual.

Skills do Claude Code usadas ativamente para guiar as decisões:
`frontend-design`, `bencium-innovative-ux-designer`, `apple-design`,
`emil-design-eng` e `find-animation-opportunities` (auditoria final de gaps de
motion). `pick-ui-library` e `review-animations` são skills sem invocação
direta pelo modelo; os princípios delas (evitar dependências pesadas,
transições ao invés de keyframes em UI interativa) foram aplicados mesmo assim.

## 1. Sistema de reveal-on-scroll (novo)

- `src/app/styles/motion.css` (novo arquivo, importado em `globals.css`):
  define `[data-reveal]` (opacity 0 + `translateY(22px)` → estado normal via
  `.in-view`, transição de 640ms com `--ease-out`) e suporte a atraso em
  cascata via `--reveal-delay` para grupos (`[data-reveal-group]`).
- `src/components/scroll-reveal.tsx` (novo componente client): usa
  `IntersectionObserver` para adicionar `.in-view` a cada `[data-reveal]`
  quando entra na viewport (uma vez só, depois desconecta). Recalcula o
  atraso em cascata dos grupos e reobserva os elementos a cada troca de rota
  (via `usePathname`), já que o layout raiz do App Router não remonta entre
  navegações. Fallback: com `prefers-reduced-motion` ou sem suporte a
  `IntersectionObserver`, todos os elementos aparecem direto, sem transição.
  Montado uma única vez em `src/app/layout.tsx`.
- Antes, `.section-head`, `.category-hero` e `.custom-order-banner` tinham
  uma animação `fade-up` disparada só no *mount* da página — ou seja, para
  seções abaixo da dobra (a maioria) a animação já tinha terminado antes do
  usuário rolar até lá, um efeito desperdiçado. Isso foi substituído por
  reveal real disparado pela rolagem em: `page.tsx` (seções "Navegue por
  categoria", "Explore a loja", banner de encomenda, faixa de confiança),
  `busca/page.tsx`, `encomendas/page.tsx` ("como funciona"),
  `avaliacoes/page.tsx` (lista de depoimentos), `faq/page.tsx` (acordeão),
  `minhas-compras/page.tsx` (lista de pedidos) e a grade de produtos em
  `src/components/catalog.tsx` (usada pela home e por todas as páginas de
  categoria). O hero da home e o `.category-hero` de topo de página
  continuam com animação de entrada imediata no mount (são a primeira coisa
  vista, não fazem sentido esperar rolagem).

## 2. Feedback de "adicionado ao carrinho" (novo)

- `src/components/product-card.tsx`: o botão "Adicionar ao carrinho" agora
  tem um estado local (`justAdded`) que troca o rótulo para "✓ Adicionado"
  por ~1,1s após o clique, com um pulso curto (`scale` até 1.035, 380ms) e o
  ícone de check entrando com um pequeno spring (320ms). Antes o clique não
  dava nenhuma confirmação visual — o item simplesmente ia para o carrinho
  em silêncio.
- CSS em `src/app/styles/components.css` (`.card-action.is-added` +
  keyframes `add-to-cart-pulse` / `add-to-cart-check`), com
  `prefers-reduced-motion` desativando os dois keyframes.

## 3. Contador do carrinho "pula" ao aumentar (novo)

- `src/components/header.tsx`: compara o `count` do carrinho com o valor
  anterior (via `useRef`) e, quando aumenta, aplica a classe `is-bumping` no
  badge por 420ms.
- CSS em `src/app/styles/layout.css` (`.cart-pill-count.is-bumping`,
  keyframes `cart-count-bump`, `scale` até 1.4), respeitando
  `prefers-reduced-motion`.

## 4. Tipografia e timing

- `src/app/styles/base.css`: `h3` ganhou `line-height: 1.22` (antes herdava
  1.04 do bloco `h1..h4`, apertado demais para títulos de card/etapa que
  quebram em duas linhas — ex.: nomes de produto mais longos).
- `src/app/styles/tokens.css`: novo token `--ease-drawer:
  cubic-bezier(0.32, 0.72, 0, 1)` (curva de drawer estilo iOS).
- `src/app/styles/layout.css`: o slide-in do menu mobile (`.mobile-menu-sheet`)
  passou a usar `320ms var(--ease-drawer)` no lugar de
  `var(--transition-base)` genérico — entrada mais física, consistente com o
  padrão de bottom-sheet/drawer.
- `src/app/styles/checkout.css`: os botões `+`/`−` do seletor de quantidade
  no carrinho não tinham nenhum estado de toque (`transform: none` até no
  hover); agora têm `:active { transform: scale(0.9) }` com transição de
  100ms — pego na varredura final de oportunidades de animação.

## 5. Correção de tooling (não visual)

- `eslint.config.mjs`: adicionado `{ ignores: [".next/**"] }`. O config flat
  atual não excluía a pasta de build, então `npm run lint` já falhava antes
  desta sessão (confirmado rodando lint com as mudanças em stash) sempre que
  havia um `.next` local de um build anterior. Corrigido para que `npm run
  lint` reflita só o código-fonte.

## O que foi verificado

- `npm run typecheck` — sem erros.
- `npm run lint` — sem erros (restam 4 avisos em `next-env.d.ts` e
  `serve-schema.js`, pré-existentes, não relacionados a este redesign e
  fora do escopo de UI).
- `npm run build` — build de produção completo, 22 rotas geradas sem erros.
- Smoke test manual: `npm run dev` + requisições a `/`, `/mm2` e `/faq`
  retornando 200, sem erros no log do servidor, com os atributos
  `data-reveal`/`data-reveal-group` presentes no HTML renderizado.

## O que não foi tocado

- Paleta de cores (`tokens.css` mantém os mesmos hex de marca).
- Rotas de API, Supabase, Mercado Pago, RPCs de checkout/estoque.
- Painel administrativo (fora do escopo visual desta rodada; recebe os
  mesmos tokens/CSS compartilhados, mas não foi alvo de mudanças dedicadas).
