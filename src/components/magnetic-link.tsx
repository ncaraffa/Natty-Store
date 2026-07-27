"use client";

import Link from "next/link";
import { useEffect, useRef, type ComponentProps } from "react";

/**
 * CTA "magnético": segue o cursor por uma fração curta do deslocamento
 * enquanto o ponteiro está por perto, e volta ao lugar com uma curva de
 * mola ao sair. Reservado para 1-2 CTAs de maior destaque por página —
 * um efeito assim em todo botão vira ruído (ver emil-design-eng:
 * frequência de uso deve limitar o quanto se anima).
 */
export function MagneticLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onPointerMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const px = event.clientX - (rect.left + rect.width / 2);
      const py = event.clientY - (rect.top + rect.height / 2);
      el!.style.transform = `translate(${(px * 0.28).toFixed(1)}px, ${(py * 0.35).toFixed(1)}px)`;
    }

    function onPointerLeave() {
      el!.style.transform = "";
    }

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <Link ref={ref} className={`magnetic-link${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </Link>
  );
}
