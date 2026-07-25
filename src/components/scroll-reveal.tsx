"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ativa o reveal-on-scroll para todo elemento com [data-reveal] presente
 * na página atual. Roda de novo a cada troca de rota (o layout raiz não
 * remonta entre navegações do App Router, então o efeito depende do
 * pathname para reencontrar os elementos da página recém-renderizada.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
      Array.from(group.querySelectorAll<HTMLElement>(":scope > [data-reveal]")).forEach(
        (el, index) => {
          el.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 70}ms`);
        },
      );
    });

    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in-view)"),
    );

    if (!items.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
