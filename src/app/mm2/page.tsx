import Link from "next/link";
import { Catalog } from "@/components/catalog";

export default function MM2Page() {
  return (
    <section>
      <div className="category-hero theme-mm2">
        <nav className="breadcrumb" aria-label="Trilha de navegação">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span>MM2</span>
        </nav>
        <span className="eyebrow">Catálogo</span>
        <h1>Murder Mystery 2</h1>
        <p>Skins, armas e sets.</p>
      </div>
      <Catalog category="mm2" />
    </section>
  );
}
