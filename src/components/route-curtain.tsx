"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Cortina de transição entre páginas: uma faixa em gradiente de marca
 * varre a tela a cada troca de rota, disfarçando o instante da troca de
 * conteúdo (ver .page-transition em motion.css, que cuida do reveal do
 * conteúdo por baixo). Não roda no carregamento inicial — só em
 * navegações subsequentes, quando `pathname` muda de fato.
 */
export function RouteCurtain() {
  const pathname = usePathname();
  const [sweeping, setSweeping] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setSweeping(true);
    const id = setTimeout(() => setSweeping(false), 640);
    return () => clearTimeout(id);
  }, [pathname]);

  return <div className={`route-curtain${sweeping ? " is-sweeping" : ""}`} aria-hidden="true" />;
}
