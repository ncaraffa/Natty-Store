-- CORREÇÃO CRÍTICA: restaura reserve_checkout para a versão real de produção (descoberta via
-- pg_get_functiondef, pois divergia de supabase/schema.sql e das migrações 08/09 deste diretório,
-- que a haviam substituído por engano por uma versão simplificada). A versão real:
--   - retorna TABLE(order_id, order_status, payment_status, total_cents, reservation_expires_at),
--     não public.orders (é o formato que src/app/api/checkout/route.ts espera);
--   - recebe p_auth_user_id e already faz upsert em public.customers + vincula customer_id;
--   - valida novamente o checkout_fingerprint em reuso de idempotency_key;
--   - validações de item mais estritas (tipos explícitos de product_id/quantity no JSON).
-- Cupom é adicionado como parâmetro novo no final, sem alterar nada do comportamento existente.
begin;

drop function if exists public.reserve_checkout(text,text,text,jsonb,interval,text);
drop function if exists public.reserve_checkout(text,text,text,jsonb,uuid,interval);

create or replace function public.reserve_checkout(
  p_idempotency_key text,
  p_guest_roblox_nick text,
  p_guest_contact text,
  p_items jsonb,
  p_auth_user_id uuid default null,
  p_reservation_ttl interval default interval '15 minutes',
  p_coupon_code text default null
)
returns table(order_id uuid, order_status order_status, payment_status payment_status, total_cents integer, reservation_expires_at timestamptz)
language plpgsql security definer set search_path to 'public', 'pg_temp' as $function$
declare
  v_order public.orders%rowtype;
  v_order_id uuid := gen_random_uuid();
  v_reservation_id uuid;
  v_customer_id uuid;
  v_expires_at timestamptz;
  v_checkout_fingerprint text;
  v_subtotal_cents integer;
  v_discount_cents integer := 0;
  v_coupon public.coupons%rowtype;
  v_coupon_code text;
begin
  if p_idempotency_key is null
     or char_length(btrim(p_idempotency_key)) not between 16 and 200 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;

  if p_guest_roblox_nick is null
     or char_length(btrim(p_guest_roblox_nick)) not between 1 and 80 then
    raise exception 'invalid roblox nick' using errcode = '22023';
  end if;

  if p_guest_contact is null
     or char_length(btrim(p_guest_contact)) not between 1 and 200 then
    raise exception 'invalid contact' using errcode = '22023';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'invalid items' using errcode = '22023';
  end if;

  if p_reservation_ttl is null
     or p_reservation_ttl < interval '1 minute'
     or p_reservation_ttl > interval '30 minutes' then
    raise exception 'invalid reservation ttl' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(item.value) <> 'object'
       or not (item.value ? 'product_id')
       or not (item.value ? 'quantity')
       or jsonb_typeof(item.value -> 'product_id') <> 'string'
       or jsonb_typeof(item.value -> 'quantity') <> 'number'
       or (item.value ->> 'product_id') is null
       or (item.value ->> 'product_id') = ''
       or (item.value ->> 'quantity') !~ '^[0-9]+$'
  ) then
    raise exception 'malformed checkout item' using errcode = '22023';
  end if;

  create temporary table checkout_lines (
    product_id uuid primary key,
    quantity integer not null
  ) on commit drop;

  begin
    insert into pg_temp.checkout_lines (product_id, quantity)
    select
      parsed.product_id,
      sum(parsed.quantity)::integer
    from (
      select
        (item.value ->> 'product_id')::uuid as product_id,
        (item.value ->> 'quantity')::integer as quantity
      from jsonb_array_elements(p_items) as item(value)
    ) as parsed
    group by parsed.product_id;
  exception
    when invalid_text_representation or numeric_value_out_of_range then
      raise exception 'malformed checkout item' using errcode = '22023';
  end;

  if not exists (select 1 from pg_temp.checkout_lines)
     or exists (
       select 1
       from pg_temp.checkout_lines
       where quantity <= 0 or quantity > 99
     ) then
    raise exception 'invalid quantities' using errcode = '22023';
  end if;

  v_coupon_code := nullif(upper(btrim(p_coupon_code)), '');

  select jsonb_build_object(
    'auth_user_id', p_auth_user_id,
    'roblox_nick', btrim(p_guest_roblox_nick),
    'contact', btrim(p_guest_contact),
    'coupon_code', v_coupon_code,
    'items', jsonb_agg(
      jsonb_build_object(
        'product_id', line.product_id,
        'quantity', line.quantity
      )
      order by line.product_id
    )
  )::text
  into v_checkout_fingerprint
  from pg_temp.checkout_lines as line;

  perform pg_advisory_xact_lock(hashtextextended(btrim(p_idempotency_key), 0));

  select existing_order.*
  into v_order
  from public.orders as existing_order
  where existing_order.idempotency_key = btrim(p_idempotency_key);

  if found then
    if v_order.checkout_fingerprint <> v_checkout_fingerprint then
      raise exception 'idempotency key already used for a different checkout'
        using errcode = '22023';
    end if;

    drop table pg_temp.checkout_lines;

    return query
    select
      v_order.id,
      v_order.status,
      v_order.payment_status,
      v_order.total_cents,
      v_order.reservation_expires_at;
    return;
  end if;

  if p_auth_user_id is not null then
    if not exists (
      select 1
      from auth.users as auth_user
      where auth_user.id = p_auth_user_id
    ) then
      raise exception 'invalid authenticated user' using errcode = '22023';
    end if;

    insert into public.customers (
      auth_user_id,
      roblox_nick,
      contact
    )
    values (
      p_auth_user_id,
      btrim(p_guest_roblox_nick),
      btrim(p_guest_contact)
    )
    on conflict (auth_user_id)
    do update set auth_user_id = excluded.auth_user_id
    returning id into v_customer_id;
  end if;

  perform 1
  from public.inventory as inventory_row
  join pg_temp.checkout_lines as line
    on line.product_id = inventory_row.product_id
  order by inventory_row.product_id
  for update of inventory_row;

  if exists (
    select 1
    from pg_temp.checkout_lines as line
    left join public.products as product
      on product.id = line.product_id
    left join public.inventory as inventory_row
      on inventory_row.product_id = line.product_id
    where product.id is null
       or inventory_row.product_id is null
       or not product.active
       or inventory_row.sell_policy = 'disabled'
       or (
         inventory_row.sell_policy = 'in_stock'
         and (
           inventory_row.public_status = 'unavailable'
           or inventory_row.on_hand - inventory_row.reserved < line.quantity
         )
       )
  ) then
    raise exception 'product unavailable or insufficient stock' using errcode = 'P0001';
  end if;

  select sum(product.price_cents::bigint * line.quantity::bigint)::integer
  into v_subtotal_cents
  from pg_temp.checkout_lines as line
  join public.products as product on product.id = line.product_id;

  if v_coupon_code is not null then
    select * into v_coupon from public.coupons where code = v_coupon_code for update;
    if not found or not v_coupon.active
       or (v_coupon.starts_at is not null and v_coupon.starts_at > now())
       or (v_coupon.ends_at is not null and v_coupon.ends_at < now())
       or (v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses)
       or v_subtotal_cents < v_coupon.min_order_cents
    then
      raise exception 'invalid coupon' using errcode = 'P0003';
    end if;

    v_discount_cents := case when v_coupon.discount_type = 'percent'
      then (v_subtotal_cents * v_coupon.discount_value) / 100
      else v_coupon.discount_value end;
    if v_discount_cents > v_subtotal_cents then v_discount_cents := v_subtotal_cents; end if;

    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  v_expires_at := now() + p_reservation_ttl;

  insert into public.orders (
    id,
    customer_id,
    guest_roblox_nick,
    guest_contact,
    status,
    total_cents,
    coupon_code,
    discount_cents,
    idempotency_key,
    checkout_fingerprint,
    reservation_expires_at
  )
  values (
    v_order_id,
    v_customer_id,
    btrim(p_guest_roblox_nick),
    btrim(p_guest_contact),
    'stock_reserved',
    v_subtotal_cents - v_discount_cents,
    v_coupon_code,
    v_discount_cents,
    btrim(p_idempotency_key),
    v_checkout_fingerprint,
    v_expires_at
  );

  insert into public.order_items (
    order_id,
    product_id,
    product_name_snapshot,
    unit_price_cents,
    quantity,
    sell_policy_snapshot
  )
  select
    v_order_id,
    product.id,
    product.name,
    product.price_cents,
    line.quantity,
    inventory_row.sell_policy
  from pg_temp.checkout_lines as line
  join public.products as product on product.id = line.product_id
  join public.inventory as inventory_row on inventory_row.product_id = product.id;

  insert into public.stock_reservations (order_id, expires_at)
  values (v_order_id, v_expires_at)
  returning id into v_reservation_id;

  insert into public.stock_reservation_items (
    reservation_id,
    product_id,
    quantity
  )
  select
    v_reservation_id,
    line.product_id,
    line.quantity
  from pg_temp.checkout_lines as line
  join public.inventory as inventory_row
    on inventory_row.product_id = line.product_id
  where inventory_row.sell_policy = 'in_stock';

  update public.inventory as inventory_row
  set
    reserved = inventory_row.reserved + line.quantity,
    updated_at = now()
  from pg_temp.checkout_lines as line
  where inventory_row.product_id = line.product_id
    and inventory_row.sell_policy = 'in_stock';

  select created_order.*
  into v_order
  from public.orders as created_order
  where created_order.id = v_order_id;

  drop table pg_temp.checkout_lines;

  return query
  select
    v_order.id,
    v_order.status,
    v_order.payment_status,
    v_order.total_cents,
    v_order.reservation_expires_at;
end;
$function$;

revoke all on function public.reserve_checkout(text,text,text,jsonb,uuid,interval,text) from public, anon, authenticated;
grant execute on function public.reserve_checkout(text,text,text,jsonb,uuid,interval,text) to service_role;

commit;
