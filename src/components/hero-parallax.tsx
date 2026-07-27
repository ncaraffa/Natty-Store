"use client";

import { useEffect, useRef } from "react";

/**
 * Palco 3D do hero: combina o parallax de scroll existente (sobe um
 * pouco mais rápido que o resto do conteúdo) com um tilt 3D que segue
 * o mouse, suavizado por interpolação linear a cada frame (rAF) em vez
 * de aplicado direto — o valor "persegue" o alvo continuamente, o que
 * lê como física real (ver apple-design: motion deve ter momentum, não
 * saltar pro valor final). Só `transform`/propriedades compostas via
 * custom property são tocadas (composição, sem reflow/repaint).
 */
export function HeroParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let scrollFrame = 0;
    function updateScroll() {
      scrollFrame = 0;
      const y = Math.max(-32, -(window.scrollY * 0.18));
      el!.style.setProperty("--parallax-y", `${y}px`);
    }
    function onScroll() {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(updateScroll);
    }
    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetGlowX = 50;
    let targetGlowY = 50;
    let glowX = 50;
    let glowY = 50;
    let tiltFrame = 0;

    function tick() {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      glowX += (targetGlowX - glowX) * 0.09;
      glowY += (targetGlowY - glowY) * 0.09;

      el!.style.setProperty("--tilt-x", `${currentX.toFixed(2)}deg`);
      el!.style.setProperty("--tilt-y", `${currentY.toFixed(2)}deg`);
      el!.style.setProperty("--glow-x", `${glowX.toFixed(1)}%`);
      el!.style.setProperty("--glow-y", `${glowY.toFixed(1)}%`);

      const settled =
        Math.abs(targetX - currentX) < 0.01 &&
        Math.abs(targetY - currentY) < 0.01 &&
        Math.abs(targetGlowX - glowX) < 0.05 &&
        Math.abs(targetGlowY - glowY) < 0.05;

      tiltFrame = settled ? 0 : requestAnimationFrame(tick);
    }

    function onPointerMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = -py * 14;
      targetY = px * 16;
      targetGlowX = (px + 0.5) * 100;
      targetGlowY = (py + 0.5) * 100;
      if (!tiltFrame) tiltFrame = requestAnimationFrame(tick);
    }

    function onPointerLeave() {
      targetX = 0;
      targetY = 0;
      targetGlowX = 50;
      targetGlowY = 50;
      if (!tiltFrame) tiltFrame = requestAnimationFrame(tick);
    }

    if (canTilt) {
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (canTilt) {
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerleave", onPointerLeave);
      }
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
    };
  }, []);

  return (
    <div ref={ref} className="hero-parallax">
      {children}
    </div>
  );
}
