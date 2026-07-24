import { notFound } from "next/navigation";
import Link from "next/link";
import { Catalog } from "@/components/catalog";
import type { Category } from "@/types";

const pages: Record<string, { title: string; category: Category; theme: string; blurb: string }> = {
  mm2: {
    title: "Murder Mystery 2",
    category: "mm2",
    theme: "theme-mm2",
    blurb: "Skins, armas e sets.",
  },
  ftf: {
    title: "Flee the Facility",
    category: "ftf",
    theme: "theme-ftf",
    blurb: "Sets e marretas para escapar com estilo.",
  },
  "adopt-me": {
    title: "Adopt Me",
    category: "adopt-me",
    theme: "theme-adopt",
    blurb: "Pets e itens fofos para o seu mundo em Adopt Me.",
  },
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const page = pages[category];
  if (!page) notFound();

  return (
    <section>
      <div className={`category-hero ${page.theme}`}>
        <nav className="breadcrumb" aria-label="Trilha de navegação">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span>{page.title}</span>
        </nav>
        <span className="eyebrow">Catálogo</span>
        <h1>{page.title}</h1>
        <p>{page.blurb}</p>
      </div>
      <Catalog category={page.category} />
    </section>
  );
}
