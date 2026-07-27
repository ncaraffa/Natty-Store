"use client";

import { useEffect, useRef } from "react";

/**
 * Parallax sutil da arte do hero: conforme a página rola, o elemento
 * sobe um pouco mais rápido que o restante do conteúdo, dando sensação
 * de profundidade só enquanto o hero ainda está visível. Só a
 * propriedade `transform` é tocada (composição, sem reflow), e o
 * listener de scroll é limitado a um frame por vez via rAF.
 */
export function HeroParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    function update() {
      frame = 0;
      const y = Math.max(-32, -(window.scrollY * 0.18));
      el!.style.setProperty("--parallax-y", `${y}px`);
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="hero-parallax">
      {children}
    </div>
  );
}
