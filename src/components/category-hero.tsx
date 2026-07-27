import Link from "next/link";
import { RevealWords } from "@/components/reveal-words";

const themeClass = {
  mm2: "theme-mm2",
  ftf: "theme-ftf",
  "adopt-me": "theme-adopt",
} as const;

export function CategoryHero({
  theme,
  breadcrumb,
  title,
  description,
}: {
  theme: keyof typeof themeClass;
  breadcrumb: string;
  title: string;
  description: string;
}) {
  return (
    <div className={`category-hero ${themeClass[theme]}`}>
      <div className="category-hero__aurora" aria-hidden="true">
        <span className="category-hero__blob category-hero__blob--a" />
        <span className="category-hero__blob category-hero__blob--b" />
      </div>
      <nav className="breadcrumb" data-reveal aria-label="Trilha de navegação">
        <Link href="/">Início</Link>
        <span aria-hidden="true">/</span>
        <span>{breadcrumb}</span>
      </nav>
      <span className="eyebrow" data-reveal style={{ "--reveal-delay": "70ms" } as React.CSSProperties}>
        Catálogo
      </span>
      <h1>
        <RevealWords text={title} />
      </h1>
      <p data-reveal style={{ "--reveal-delay": "140ms" } as React.CSSProperties}>
        {description}
      </p>
    </div>
  );
}
