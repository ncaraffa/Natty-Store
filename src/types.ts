export type Category = "mm2" | "ftf" | "adopt-me";
// Estado público não contém nem permite inferir a quantidade interna.
export type StockStatus = "available" | "limited" | "unavailable" | "preorder" | "backorder";
export type InventorySellPolicy = "in_stock" | "preorder" | "backorder" | "disabled";
export type ReservationStatus = "active" | "consumed" | "released" | "expired";
export type Product = { id:string; slug:string; name:string; category:Category; description:string; priceCents:number; stockStatus:StockStatus; image?:string };
export type CartLine = { productId:string; quantity:number };
