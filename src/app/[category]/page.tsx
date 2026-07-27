import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { CategoryHero } from "@/components/category-hero";
import type { Category } from "@/types";

const pages: Record<
  string,
  { title: string; category: Category; theme: "mm2" | "ftf" | "adopt-me"; blurb: string }
> = {
  mm2: {
    title: "Murder Mystery 2",
    category: "mm2",
    theme: "mm2",
    blurb: "Skins, armas e sets.",
  },
  ftf: {
    title: "Flee the Facility",
    category: "ftf",
    theme: "ftf",
    blurb: "Sets e marretas para escapar com estilo.",
  },
  "adopt-me": {
    title: "Adopt Me",
    category: "adopt-me",
    theme: "adopt-me",
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
      <CategoryHero
        theme={page.theme}
        breadcrumb={page.title}
        title={page.title}
        description={page.blurb}
      />
      <Catalog category={page.category} />
    </section>
  );
}
