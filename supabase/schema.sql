-- Natty Store — esquema revisável. NÃO aplicado a projeto Supabase.
-- Toda criação de checkout deve chamar reserve_checkout no servidor (service role), nunca inserir pedidos diretamente.
-- AVISO (2026-07-23): este arquivo diverge do banco real de produção em pontos importantes (já visto duas vezes).
-- A função reserve_checkout REAL tem assinatura, retorno e colunas diferentes do que este arquivo descreve
-- (inclui p_auth_user_id, retorna TABLE(...), grava orders.checkout_fingerprint que não existe aqui).
-- Antes de recriar/alterar reserve_checkout, SEMPRE rode:
--   select pg_get_functiondef('public.reserve_checkout'::regproc);
-- e confira supabase/schema.sql contra o resultado real, nunca assuma que este arquivo está atualizado.
-- Ver sql/10_restore_reserve_checkout.sql para a versão íntegra restaurada + cupons.
create extension if not exists pgcrypto;

create type public.order_status as enum ('draft','stock_reserved','pending_payment','paid','delivering','completed','cancelled','refunded','expired');
create type public.payment_status as enum ('not_started','pending','approved','rejected','refunded');
create type public.request_status as enum ('new','reviewing','quoted','accepted','declined','completed');
create type public.inventory_public_status as enum ('available','limited','unavailable','preorder','backorder');
create type public.inventory_sell_policy as enum ('in_stock','preorder','backorder','disabled');
create type public.reservation_status as enum ('active','consumed','released','expired');

create table public.customers (
 id uuid primary key default gen_random_uuid(), auth_user_id uuid unique references auth.users(id) on delete set null,
 name text, roblox_nick text not null, contact text not null, created_at timestamptz not null default now()
);
create table public.products (
 id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, description text not null default '',
 category text not null check(category in ('mm2','ftf','adopt-me')), price_cents integer not null check(price_cents>=0), active boolean not null default false,
 image_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- public_status é apresentação pública; on_hand/reserved nunca devem ser expostos pela API pública.
create table public.inventory (
 product_id uuid primary key references public.products(id) on delete cascade,
 on_hand integer not null default 0 check(on_hand>=0), reserved integer not null default 0 check(reserved>=0 and reserved<=on_hand),
 public_status public.inventory_public_status not null default 'unavailable',
 sell_policy public.inventory_sell_policy not null default 'disabled', updated_at timestamptz not null default now(),
 check ((sell_policy='in_stock' and public_status in ('available','limited','unavailable')) or
        (sell_policy='preorder' and public_status='preorder') or
        (sell_policy='backorder' and public_status='backorder') or
        (sell_policy='disabled' and public_status='unavailable'))
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete set null,
 guest_roblox_nick text not null, guest_contact text not null, status public.order_status not null default 'draft',
 payment_status public.payment_status not null default 'not_started', payment_provider text, provider_payment_id text unique,
 total_cents integer not null check(total_cents>=0), idempotency_key text not null unique,
 reservation_expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete restrict, product_name_snapshot text not null,
 unit_price_cents integer not null check(unit_price_cents>=0), quantity integer not null check(quantity>0),
 sell_policy_snapshot public.inventory_sell_policy not null, unique(order_id,product_id)
);
create table public.stock_reservations (
 id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id) on delete restrict,
 status public.reservation_status not null default 'active', expires_at timestamptz not null,
 created_at timestamptz not null default now(), finalized_at timestamptz
);
create table public.stock_reservation_items (
 reservation_id uuid not null references public.stock_reservations(id) on delete restrict,
 product_id uuid not null references public.products(id) on delete restrict,
 quantity integer not null check(quantity>0), primary key(reservation_id,product_id)
);
create index stock_reservations_active_expiry_idx on public.stock_reservations(expires_at) where status='active';
create table public.custom_requests (
 id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete set null,
 name text not null, roblox_nick text not null, contact text not null, game text not null, request text not null,
 status public.request_status not null default 'new', created_at timestamptz not null default now()
);
-- Projeção pública deliberada: disponibiliza o rótulo, nunca on_hand/reserved nem sell_policy.
create view public.catalog_products with (security_barrier=true) as
 select p.id,p.slug,p.name,p.description,p.category,p.price_cents,p.image_url,i.public_status
 from public.products p join public.inventory i on i.product_id=p.id where p.active=true;

-- Reserva atômica e idempotente. Preço, atividade, política e estoque vêm exclusivamente do banco.
create or replace function public.reserve_checkout(
 p_idempotency_key text, p_guest_roblox_nick text, p_guest_contact text, p_items jsonb,
 p_reservation_ttl interval default interval '15 minutes'
) returns public.orders
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_order public.orders; v_order_id uuid := gen_random_uuid(); v_reservation_id uuid; v_expires_at timestamptz;
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
 -- Evita aceitar silenciosamente elementos malformados.
 if (select sum(quantity) from checkout_lines) <> (select sum((x->>'quantity')::integer) from jsonb_array_elements(p_items) x) then raise exception 'malformed checkout item' using errcode='22023'; end if;

 -- Ordem determinística reduz deadlocks entre checkouts concorrentes.
 perform 1 from public.inventory i join checkout_lines l on l.product_id=i.product_id order by i.product_id for update of i;
 if exists(select 1 from checkout_lines l left join public.products p on p.id=l.product_id left join public.inventory i on i.product_id=l.product_id
           where p.id is null or i.product_id is null or not p.active or i.sell_policy='disabled' or
                 (i.sell_policy='in_stock' and (i.public_status='unavailable' or i.on_hand-i.reserved<l.quantity)))
 then raise exception 'product unavailable or insufficient stock' using errcode='P0001'; end if;

 v_expires_at := now()+p_reservation_ttl;
 insert into public.orders(id,guest_roblox_nick,guest_contact,status,total_cents,idempotency_key,reservation_expires_at)
 select v_order_id,btrim(p_guest_roblox_nick),btrim(p_guest_contact),'stock_reserved',sum(p.price_cents*l.quantity),p_idempotency_key,v_expires_at
 from checkout_lines l join public.products p on p.id=l.product_id;
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

create or replace function public.release_stock_reservation(p_order_id uuid, p_as_expired boolean default false)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare v_res public.stock_reservations;
begin
 select * into v_res from public.stock_reservations where order_id=p_order_id for update;
 if not found or v_res.status<>'active' then return false; end if;
 perform 1 from public.inventory i join public.stock_reservation_items ri on ri.product_id=i.product_id
  where ri.reservation_id=v_res.id order by i.product_id for update of i;
 update public.inventory i set reserved=i.reserved-ri.quantity,updated_at=now() from public.stock_reservation_items ri
  where ri.reservation_id=v_res.id and i.product_id=ri.product_id;
 update public.stock_reservations set status=case when p_as_expired then 'expired'::public.reservation_status else 'released'::public.reservation_status end,finalized_at=now() where id=v_res.id;
 update public.orders set status=case when p_as_expired then 'expired'::public.order_status else 'cancelled'::public.order_status end,reservation_expires_at=null,updated_at=now()
  where id=p_order_id and status in ('stock_reserved','pending_payment');
 return true;
end $$;

-- Chamar em job server-side periódico; SKIP LOCKED permite múltiplos workers sem dupla liberação.
create or replace function public.expire_stock_reservations(p_limit integer default 100)
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare v_id uuid; v_count integer:=0;
begin
 if p_limit not between 1 and 1000 then raise exception 'invalid limit' using errcode='22023'; end if;
 for v_id in select order_id from public.stock_reservations where status='active' and expires_at<=now() order by expires_at for update skip locked limit p_limit loop
  if public.release_stock_reservation(v_id,true) then v_count:=v_count+1; end if;
 end loop; return v_count;
end $$;

-- Consome apenas estoque físico após confirmação autoritativa futura de pagamento.
create or replace function public.consume_stock_reservation(p_order_id uuid)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare v_res public.stock_reservations;
begin
 select * into v_res from public.stock_reservations where order_id=p_order_id for update;
 if not found or v_res.status<>'active' then return false; end if;
 if v_res.expires_at<=now() then perform public.release_stock_reservation(p_order_id,true); return false; end if;
 perform 1 from public.inventory i join public.stock_reservation_items ri on ri.product_id=i.product_id where ri.reservation_id=v_res.id order by i.product_id for update of i;
 update public.inventory i set on_hand=i.on_hand-ri.quantity,reserved=i.reserved-ri.quantity,updated_at=now() from public.stock_reservation_items ri where ri.reservation_id=v_res.id and i.product_id=ri.product_id;
 update public.stock_reservations set status='consumed',finalized_at=now() where id=v_res.id;
 update public.orders set status='paid',payment_status='approved',reservation_expires_at=null,updated_at=now() where id=p_order_id;
 return true;
end $$;

alter table public.customers enable row level security; alter table public.products enable row level security;
alter table public.inventory enable row level security; alter table public.orders enable row level security;
alter table public.order_items enable row level security; alter table public.stock_reservations enable row level security;
alter table public.stock_reservation_items enable row level security; alter table public.custom_requests enable row level security;
create policy "active products are public" on public.products for select using (active=true);
create policy "customer reads own profile" on public.customers for select using (auth.uid()=auth_user_id);
create policy "customer reads own orders" on public.orders for select using (customer_id in (select id from public.customers where auth_user_id=auth.uid()));
create policy "customer reads own order items" on public.order_items for select using (order_id in (select o.id from public.orders o join public.customers c on c.id=o.customer_id where c.auth_user_id=auth.uid()));
grant select on public.catalog_products to anon, authenticated;
-- Sem policy pública para inventory/reservas. Revogar RPCs de anon/authenticated; conceder somente ao papel server-side escolhido.
revoke all on function public.reserve_checkout(text,text,text,jsonb,interval) from public, anon, authenticated;
revoke all on function public.release_stock_reservation(uuid,boolean) from public, anon, authenticated;
revoke all on function public.expire_stock_reservations(integer) from public, anon, authenticated;
revoke all on function public.consume_stock_reservation(uuid) from public, anon, authenticated;
grant execute on function public.reserve_checkout(text,text,text,jsonb,interval) to service_role;
grant execute on function public.release_stock_reservation(uuid,boolean) to service_role;
grant execute on function public.expire_stock_reservations(integer) to service_role;
grant execute on function public.consume_stock_reservation(uuid) to service_role;
