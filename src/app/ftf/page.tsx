import { Catalog } from "@/components/catalog";
import { CategoryHero } from "@/components/category-hero";

export default function FTFPage() {
  return (
    <section>
      <CategoryHero
        theme="ftf"
        breadcrumb="FTF"
        title="Flee the Facility"
        description="Sets e marretas para escapar com estilo."
      />
      <Catalog category="ftf" />
    </section>
  );
}
