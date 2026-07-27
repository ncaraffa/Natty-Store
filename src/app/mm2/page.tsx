import { Catalog } from "@/components/catalog";
import { CategoryHero } from "@/components/category-hero";

export default function MM2Page() {
  return (
    <section>
      <CategoryHero
        theme="mm2"
        breadcrumb="MM2"
        title="Murder Mystery 2"
        description="Skins, armas e sets."
      />
      <Catalog category="mm2" />
    </section>
  );
}
