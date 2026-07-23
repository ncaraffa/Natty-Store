-- Cupons de desconto. Aplicados dentro de reserve_checkout para manter o desconto atômico com a reserva de estoque.
begin;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value integer not null check (discount_value > 0),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  min_order_cents integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_cents integer not null default 0;

alter table public.coupons enable row level security;
-- Sem policy pública: cupom só é validado dentro da função server-side, nunca lido direto pelo navegador.

drop function if exists public.reserve_checkout(text,text,text,jsonb,interval);

create or replace function public.reserve_checkout(
 p_idempotency_key text, p_guest_roblox_nick text, p_guest_contact text, p_items jsonb,
 p_reservation_ttl interval default interval '15 minutes', p_coupon_code text default null
) returns public.orders
language plpgsql security definer set search_path = public, pg_temp as $$
declare
 v_order public.orders; v_order_id uuid := gen_random_uuid(); v_reservation_id uuid; v_expires_at timestamptz;
 v_subtotal_cents integer; v_discount_cents integer := 0; v_coupon public.coupons; v_coupon_code text;
begin
 if p_idempotency_key is null or length(btrim(p_idempotency_key)) not between 8 and 200 then raise exception 'invalid idempotency key' using errcode='22023'; end if;
 if p_guest_roblox_nick is null or length(btrim(p_guest_roblox_nick)) not between 1 and 80 then raise exception 'invalid roblox nick' using errcode='22023'; end if;
 if p_guest_contact is null or length(btrim(p_guest_contact)) not between 1 and 200 then raise exception 'invalid contact' using errcode='22023'; end if;
 if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then raise exception 'invalid items' using errcode='22023'; end if;
 if p_reservation_ttl < interval '1 minute' or p_reservation_ttl > interval '30 minutes' then raise exception 'invalid reservation ttl' using errcode='22023'; end if;

 perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key, 0));
 select * into v_order from public.orders where idempotency_key=p_idempotency_key;
 if found then return v_order; end if;

 create temporary table checkout_lines(product_id uuid primary key, quantity integer not null) on commit drop;
 begin
  insert into checkout_lines(product_id,quantity)
  select (x->>'product_id')::uuid, sum((x->>'quantity')::integer)::integer from jsonb_array_elements(p_items) x
  where jsonb_typeof(x)='object' and x ? 'product_id' and x ? 'quantity'
  group by (x->>'product_id')::uuid;
 exception when others then raise exception 'malformed checkout item' using errcode='22023'; end;
 if (select count(*) from checkout_lines)=0 or exists(select 1 from checkout_lines where quantity<=0 or quantity>99) then raise exception 'invalid quantities' using errcode='22023'; end if;
 if (select sum(quantity) from checkout_lines) <> (select sum((x->>'quantity')::integer) from jsonb_array_elements(p_items) x) then raise exception 'malformed checkout item' using errcode='22023'; end if;

 perform 1 from public.inventory i join checkout_lines l on l.product_id=i.product_id order by i.product_id for update of i;
 if exists(select 1 from checkout_lines l left join public.products p on p.id=l.product_id left join public.inventory i on i.product_id=l.product_id
           where p.id is null or i.product_id is null or not p.active or i.sell_policy='disabled' or
                 (i.sell_policy='in_stock' and (i.public_status='unavailable' or i.on_hand-i.reserved<l.quantity)))
 then raise exception 'product unavailable or insufficient stock' using errcode='P0001'; end if;

 select sum(p.price_cents*l.quantity) into v_subtotal_cents from checkout_lines l join public.products p on p.id=l.product_id;

 v_coupon_code := nullif(upper(btrim(p_coupon_code)), '');
 if v_coupon_code is not null then
  select * into v_coupon from public.coupons where code = v_coupon_code for update;
  if not found or not v_coupon.active
     or (v_coupon.starts_at is not null and v_coupon.starts_at > now())
     or (v_coupon.ends_at is not null and v_coupon.ends_at < now())
     or (v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses)
     or v_subtotal_cents < v_coupon.min_order_cents
  then raise exception 'invalid coupon' using errcode='P0003'; end if;

  v_discount_cents := case when v_coupon.discount_type = 'percent'
    then (v_subtotal_cents * v_coupon.discount_value) / 100
    else v_coupon.discount_value end;
  if v_discount_cents > v_subtotal_cents then v_discount_cents := v_subtotal_cents; end if;

  update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
 end if;

 v_expires_at := now()+p_reservation_ttl;
 insert into public.orders(id,guest_roblox_nick,guest_contact,status,total_cents,coupon_code,discount_cents,idempotency_key,reservation_expires_at)
 values (v_order_id,btrim(p_guest_roblox_nick),btrim(p_guest_contact),'stock_reserved',v_subtotal_cents-v_discount_cents,v_coupon_code,v_discount_cents,p_idempotency_key,v_expires_at);
 insert into public.order_items(order_id,product_id,product_name_snapshot,unit_price_cents,quantity,sell_policy_snapshot)
 select v_order_id,p.id,p.name,p.price_cents,l.quantity,i.sell_policy from checkout_lines l join public.products p on p.id=l.product_id join public.inventory i on i.product_id=p.id;
 insert into public.stock_reservations(order_id,expires_at) values(v_order_id,v_expires_at) returning id into v_reservation_id;
 insert into public.stock_reservation_items(reservation_id,product_id,quantity)
 select v_reservation_id,l.product_id,l.quantity from checkout_lines l join public.inventory i on i.product_id=l.product_id where i.sell_policy='in_stock';
 update public.inventory i set reserved=i.reserved+l.quantity,updated_at=now() from checkout_lines l
 where i.product_id=l.product_id and i.sell_policy='in_stock';
 select * into v_order from public.orders where id=v_order_id;
 drop table checkout_lines;
 return v_order;
end $$;

revoke all on function public.reserve_checkout(text,text,text,jsonb,interval,text) from public, anon, authenticated;
grant execute on function public.reserve_checkout(text,text,text,jsonb,interval,text) to service_role;

commit;
