import type { CSSProperties } from "react";

/**
 * Cada palavra fica num invólucro com overflow escondido e sobe de
 * dentro do próprio espaço (ver .reveal-word em motion.css) — efeito
 * de entrada cinematográfico, roda uma vez no carregamento da página.
 */
export function RevealWords({ text, startAt = 0 }: { text: string; startAt?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="reveal-word">
            <span
              className="reveal-word__inner"
              style={{ "--i": startAt + index } as CSSProperties}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
