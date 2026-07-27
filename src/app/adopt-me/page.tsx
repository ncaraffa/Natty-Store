import { Catalog } from "@/components/catalog";
import { CategoryHero } from "@/components/category-hero";

export default function AdoptMePage() {
  return (
    <section>
      <CategoryHero
        theme="adopt-me"
        breadcrumb="Adopt Me"
        title="Adopt Me"
        description="Pets e itens fofos para o seu mundo em Adopt Me."
      />
      <Catalog category="adopt-me" />
    </section>
  );
}
