begin;

do $$
declare
  v_product_id uuid;
begin
  if exists (
    select 1
    from public.products
    where slug = 'set-sweet'
  ) then
    raise exception 'product slug already exists: set-sweet';
  end if;

  insert into public.products (
    slug,
    name,
    description,
    category,
    price_cents,
    active,
    image_url
  )
  values (
    'set-sweet',
    'Set Sweet',
    'O Sweet Set foi lançado durante o evento de Valentine’s Day 2026 do Murder Mystery 2. O conjunto é composto pelas armas Godly Sweet (faca) e Treat (arma), ambas com uma estética inspirada em doces e confeitos. É um set limitado e exclusivo, ideal para colecionadores.',
    'mm2',
    4500,
    true,
    '/products/set-sweet.jpg'
  )
  returning id into v_product_id;

  insert into public.inventory (
    product_id,
    on_hand,
    reserved,
    public_status,
    sell_policy
  )
  values (
    v_product_id,
    2,
    0,
    'limited',
    'in_stock'
  );
end
$$;

commit;
