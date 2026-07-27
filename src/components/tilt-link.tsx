"use client";

import Link from "next/link";
import { useEffect, useRef, type ComponentProps, type PointerEvent } from "react";

/**
 * Mesmo padrão de tilt 3D do cartão de produto (ver
 * src/components/product-card.tsx), reaproveitado para os cartões de
 * navegação por jogo — ambos ganham a mesma "física de carta" ao
 * passar o mouse, sem depender de biblioteca externa.
 */
export function TiltLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  const ref = useRef<HTMLAnchorElement>(null);
  const canTiltRef = useRef(false);

  useEffect(() => {
    canTiltRef.current =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
    if (!canTiltRef.current) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * 8).toFixed(2)}deg`);
  }

  function handlePointerLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <Link
      ref={ref}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </Link>
  );
}
