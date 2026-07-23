-- Selo opcional exibido no card do produto: novo, promoção, mais vendido ou destaque.
begin;

alter table public.products
  add column if not exists badge text check (badge in ('new','promo','bestseller','featured'));

create or replace view public.catalog_products with (security_barrier=true) as
 select p.id,p.slug,p.name,p.description,p.category,p.price_cents,p.image_url,p.badge,i.public_status
 from public.products p join public.inventory i on i.product_id=p.id where p.active=true;

grant select on public.catalog_products to anon, authenticated;

commit;
