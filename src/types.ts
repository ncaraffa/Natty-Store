export type Category = "mm2" | "ftf" | "adopt-me";
// Estado público não contém nem permite inferir a quantidade interna.
export type StockStatus = "available" | "limited" | "unavailable" | "preorder" | "backorder";
export type InventorySellPolicy = "in_stock" | "preorder" | "backorder" | "disabled";
export type ReservationStatus = "active" | "consumed" | "released" | "expired";
export type ProductBadge = "new" | "promo" | "bestseller" | "featured";
export type Product = { id:string; slug:string; name:string; category:Category; description:string; priceCents:number; stockStatus:StockStatus; image?:string; badge?:ProductBadge };
export const badgeLabels: Record<ProductBadge, string> = { new: "Novo", promo: "Promoção", bestseller: "Mais vendido", featured: "Destaque" };
export type CartLine = { productId:string; quantity:number };
export type ReviewStats = { totalReviews:number; averageRating:number; star5:number; star4:number; star3:number; star2:number; star1:number };
export type Review = { id:string; rating:number; comment:string|null; adminReply:string|null; adminReplyAt:string|null; createdAt:string };
