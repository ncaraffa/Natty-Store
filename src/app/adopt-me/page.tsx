import Link from "next/link";
import { Catalog } from "@/components/catalog";

export default function AdoptMePage() {
  return (
    <section>
      <div className="category-hero theme-adopt">
        <nav className="breadcrumb" aria-label="Trilha de navegação">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span>Adopt Me</span>
        </nav>
        <span className="eyebrow">Catálogo</span>
        <h1>Adopt Me</h1>
        <p>Pets e itens fofos para o seu mundo em Adopt Me.</p>
      </div>
      <Catalog category="adopt-me" />
    </section>
  );
}
