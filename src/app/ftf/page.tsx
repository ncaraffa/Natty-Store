import Link from "next/link";
import { Catalog } from "@/components/catalog";

export default function FTFPage() {
  return (
    <section>
      <div className="category-hero theme-ftf">
        <nav className="breadcrumb" aria-label="Trilha de navegação">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span>FTF</span>
        </nav>
        <span className="eyebrow">Catálogo</span>
        <h1>Flee the Facility</h1>
        <p>Sets e marretas para escapar com estilo.</p>
      </div>
      <Catalog category="ftf" />
    </section>
  );
}
