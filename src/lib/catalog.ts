import type { Category, Product, ProductBadge, StockStatus } from "@/types";
import { serverSupabase } from "@/lib/supabase/server";

type CatalogRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  image_url: string | null;
  badge: string | null;
  public_status: string;
};

const categories: readonly Category[] = ["mm2", "ftf", "adopt-me"];
const statuses: readonly StockStatus[] = [
  "available",
  "limited",
  "unavailable",
  "preorder",
  "backorder",
];
const badges: readonly ProductBadge[] = ["new", "promo", "bestseller", "featured"];

function isCategory(value: string): value is Category {
  return categories.includes(value as Category);
}

function isStockStatus(value: string): value is StockStatus {
  return statuses.includes(value as StockStatus);
}

function isProductBadge(value: string): value is ProductBadge {
  return badges.includes(value as ProductBadge);
}

export async function getCatalogProducts(category?: Category): Promise<Product[]> {
  const supabase = await serverSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("catalog_products")
    .select(
      "id,slug,name,description,category,price_cents,image_url,badge,public_status",
    )
    .order("name", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) {
    console.error("Falha ao carregar o catálogo público:", error.message);
    return [];
  }

  return ((data ?? []) as CatalogRow[])
    .filter(
      (row) =>
        typeof row.id === "string" &&
        typeof row.slug === "string" &&
        typeof row.name === "string" &&
        typeof row.description === "string" &&
        typeof row.price_cents === "number" &&
        Number.isInteger(row.price_cents) &&
        row.price_cents >= 0 &&
        isCategory(row.category) &&
        isStockStatus(row.public_status),
    )
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      category: row.category as Category,
      priceCents: row.price_cents,
      stockStatus: row.public_status as StockStatus,
      image: row.image_url ?? undefined,
      badge: row.badge && isProductBadge(row.badge) ? row.badge : undefined,
    }));
}
