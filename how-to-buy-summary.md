# "Como comprar na Natty Store" — resumo de design e animação

## O que foi feito

Uma nova seção `<HowToBuyDemo />` (`src/components/how-to-buy-demo.tsx` +
`src/app/styles/how-to-buy.css`), inserida na home (`src/app/page.tsx`)
entre a grade "Escolha seu jogo" e o catálogo real ("Explore a loja").

## Por que essa posição

O visitante ainda não abriu nenhum produto de verdade nesse ponto da
página. Mostrar o "tour" ali funciona como uma ponte: ele acabou de
escolher um jogo, vê em poucos segundos como o fluxo de compra funciona
sem sair da home, e desce direto para o catálogo real já sabendo o que
esperar do clique em "Adicionar ao carrinho". Colocar isso mais abaixo
(perto do rodapé) faria o usuário descobrir o fluxo só depois de já ter
tentado comprar.

## Por que uma "demo encenada" em vez de vídeo

Sem gravação real disponível, a alternativa mais honesta e mais barata
de manter é montar a demonstração com os **componentes visuais reais da
loja** (mesmas classes de `card`, `button`, `checkout-steps`,
`pix-copy-button`, `badge`, `stock`, etc.) em vez de inventar uma nova
linguagem visual só para o tour. Isso tem duas vantagens: (1) qualquer
mudança futura no design system realista já "vaza" para a demo sem
esforço extra, porque ela reaproveita as mesmas classes CSS; (2) o
usuário reconhece imediatamente que aquilo *é* a loja, não uma
ilustração genérica.

## Como a "atuação" funciona

- **Um "navegador" falso** (`.tour-frame` → `.tour-chrome` com pontinhos
  + barra de URL falsa que muda por cena) deixa claro que é uma
  simulação de tela, não uma foto de produto solta.
- **Um cursor simulado** (`Cursor`, em `how-to-buy-demo.tsx`) se move
  até o botão relevante de cada cena e "clica" (pulso de escala +
  ripple). A posição do cursor é controlada por *state* React simples
  (`phase`) e a suavidade vem só de uma `transition` CSS em `left/top`
  — nada de biblioteca de animação.
- **4 cenas** (`ProductScene`, `CartScene`, `CheckoutScene`,
  `SuccessScene`), cada uma com sua própria máquina de fases avançada
  por `setTimeout` curtos (ex.: idle → clicando → adicionado). Isso é
  JS bem leve (nenhum estado global, nenhuma lib nova) e fica isolado
  por cena, então dá pra ajustar o tempo de uma sem afetar as outras.
- A troca de cena inteira é feita pelo componente pai remontando a
  subárvore ativa com `key={step}` — a entrada usa a mesma receita de
  fade+translateY já usada no `[data-reveal]` do
  `scroll-reveal.tsx`/`motion.css`, só que disparada por mount em vez
  de `IntersectionObserver`. Remontar (em vez de manter as 4 cenas
  montadas e alternar visibilidade) evita o problema clássico de
  `animation-play-state: paused` não resetar para o frame inicial —
  cada vez que uma cena volta a ficar ativa, ela literalmente começa do
  zero.

## Player: progresso, loop e play/pause

A barra inferior imita o controle de um player de vídeo/Stories:
- 4 barrinhas de progresso (`.tour-track`), uma por cena, preenchendo
  de 0% a 100% via `@keyframes tour-progress` com a *duration* de cada
  cena vinda de `SCENES[i].duration` (props inline, sem JS por frame).
- Ao terminar o preenchimento (`onAnimationEnd`), o componente avança
  para a próxima cena automaticamente — por isso ele "toca em loop"
  sozinho, sem precisar de `setInterval` no componente pai.
- **Pausar** apenas congela essa barra de progresso
  (`animationPlayState: paused`), interrompendo o avanço automático
  entre cenas. A micro-atuação dentro da cena atual (cursor→clique,
  ~1.5–2.9s) não é pausada de propósito: são gestos curtos que já
  terminam e ficam parados no estado final, então pausar no meio deles
  teria custo de complexidade (rastrear tempo restante de vários
  `setTimeout`) sem ganho perceptível para quem está usando o controle
  para "read the page in their own time".
- Clicar em qualquer uma das 4 barras pula direto para aquela cena e
  retoma o autoplay.

## Acessibilidade e `prefers-reduced-motion`

- Toda a área visual do tour (`.tour-chrome`, `.tour-screen`) é
  `aria-hidden="true"`; um parágrafo `.sr-only` ao lado narra o mesmo
  fluxo em texto corrido para leitor de tela, então ninguém perde a
  explicação por causa da decoração.
- Os controles reais (botão play/pause, as 4 barras clicáveis) são
  `<button>` de verdade, com `aria-pressed`/`aria-current` — não é tudo
  decorativo, só a "tela" simulada é.
- Com `prefers-reduced-motion: reduce`, o autoplay começa desligado, o
  cursor simulado nem é renderizado, as animações de entrada/pulso são
  anuladas (`animation: none !important`) e cada cena já nasce no seu
  estado final (produto já "adicionado", Pix já "confirmado" etc.) em
  vez de didaticamente encenar o gesto — a pessoa ainda navega pelas 4
  barras manualmente, só sem movimento automático.

## Reaproveitamento de paleta/tokens

Nenhuma cor nova: tudo vem de `tokens.css` (`--purple`, `--deep`,
`--color-success`, `--color-warning`, `--color-accent-pink`, sombras e
raios existentes). O sparkle da cena de sucesso reaproveita literalmente
o `@keyframes sparkle-twinkle` já definido para o hero, só com uma nova
classe `.tour-sparkle` (glifo de estrela em vez do SVG do hero, mas
mesma animação).

## Verificação

- `npm run typecheck`, `npm run lint` (só os arquivos tocados — os 4
  erros de lint restantes em `next-env.d.ts`/`serve-schema.js` já
  existiam antes desta mudança) e `npm run build` rodaram limpos.
- `npm run dev` + `curl` confirmaram `GET /` → 200 com a nova seção no
  HTML.
- Conferido visualmente em Chromium headless (Playwright, instalado só
  localmente para o teste e não commitado): as 4 cenas renderizam
  corretamente, o clique manual nas barras troca de cena, o botão
  Pix mostra o estado "copiado" no tempo certo, e o toggle play/pause
  troca o ícone e congela a barra de progresso. Também verificado em
  viewport mobile (390px) sem quebra de layout.
