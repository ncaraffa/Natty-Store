/* Rabiscos decorativos (estilo "marcador") usados no tema streetwear.
   Todos são puramente visuais: aria-hidden e sem interação. */
type DoodleProps = { className?: string; style?: React.CSSProperties };

export function Sparkle({ className, style }: DoodleProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M24 3c2.2 11 9 17.8 21 21-12 3.2-18.8 10-21 21-2.2-11-9-17.8-21-21 12-3.2 18.8-10 21-21z"
        fill="var(--yellow)"
        stroke="var(--ink)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Squiggle({ className, style }: DoodleProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 120 40" fill="none" aria-hidden="true">
      <path
        d="M4 26c10-18 20-18 26 0s16 18 26 0 16-18 26 0 16 18 34-8"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Scribble({ className, style }: DoodleProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 80 110" fill="none" aria-hidden="true">
      <path
        d="M14 100C6 70 22 40 30 12c4 26-6 50 2 74 8-30 20-52 34-76-4 30-12 58-6 86"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Smiley({ className, style }: DoodleProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.4" />
      <path d="M17 19v3M31 19v3" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M15 29c5 7 13 7 18 0" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function Underline({ className, style }: DoodleProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 160 24" fill="none" aria-hidden="true">
      <path d="M4 16C46 6 104 4 156 10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 21c36-6 76-8 110-5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Burst({ className, style, children }: DoodleProps & { children?: React.ReactNode }) {
  return (
    <span className={`doodle-burst${className ? ` ${className}` : ""}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <path
          d="M100.0 6.0L112.5 29.1L132.1 11.7L136.0 37.6L160.4 28.0L155.2 53.7L181.4 53.0L167.7 75.4L192.6 83.7L172.0 100.0L192.6 116.3L167.7 124.6L181.4 147.0L155.2 146.3L160.4 172.0L136.0 162.4L132.1 188.3L112.5 170.9L100.0 194.0L87.5 170.9L67.9 188.3L64.0 162.4L39.6 172.0L44.8 146.3L18.6 147.0L32.3 124.6L7.4 116.3L28.0 100.0L7.4 83.7L32.3 75.4L18.6 53.0L44.8 53.7L39.6 28.0L64.0 37.6L67.9 11.7L87.5 29.1Z"
          fill="var(--yellow)"
          stroke="var(--ink)"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </svg>
      {children && <span className="doodle-burst__text">{children}</span>}
    </span>
  );
}

export function Blob({ className, style }: DoodleProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 600 600" aria-hidden="true">
      <path
        d="M418 62c74 26 140 92 150 176 10 82-30 132-26 204 4 76-48 132-128 140-86 8-118-46-196-40-80 6-150-24-174-104-24-82 32-130 34-206 2-74-40-122 6-170 48-50 136-28 188-36 54-8 88-20 146 36z"
        fill="var(--yellow)"
      />
      <path
        d="M470 118c22 18 42 44 52 72"
        stroke="#ffffff"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
    </svg>
  );
}
