-- Sistema de avaliações da loja (não por produto): 1 avaliação por pedido pago/concluído do cliente.
begin;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  admin_reply text,
  admin_reply_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id)
);

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

alter table public.reviews enable row level security;

-- Leitura pública de todas as avaliações (loja mostra avaliações reais, positivas ou não).
drop policy if exists "reviews are public" on public.reviews;
create policy "reviews are public" on public.reviews for select using (true);

drop policy if exists "customer reads own review insert check" on public.reviews;

-- Cliente só pode avaliar pedido próprio, pago/concluído, e uma vez por pedido (unique cuida da segunda parte).
create or replace function public.submit_review(p_order_id uuid, p_rating smallint, p_comment text default null)
returns public.reviews
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_customer_id uuid;
  v_order public.orders;
  v_review public.reviews;
begin
  select id into v_customer_id from public.customers where auth_user_id = auth.uid();
  if v_customer_id is null then raise exception 'not authenticated as customer' using errcode = '28000'; end if;

  if p_rating is null or p_rating not between 1 and 5 then raise exception 'invalid rating' using errcode = '22023'; end if;
  if p_comment is not null and length(p_comment) > 2000 then raise exception 'comment too long' using errcode = '22023'; end if;

  select * into v_order from public.orders where id = p_order_id and customer_id = v_customer_id;
  if not found then raise exception 'order not found' using errcode = 'P0002'; end if;
  if v_order.status not in ('paid', 'delivering', 'completed') then
    raise exception 'order not eligible for review' using errcode = 'P0001';
  end if;

  insert into public.reviews (customer_id, order_id, rating, comment)
  values (v_customer_id, p_order_id, p_rating, nullif(btrim(p_comment), ''))
  on conflict (order_id) do update set rating = excluded.rating, comment = excluded.comment
  returning * into v_review;

  return v_review;
end $$;

revoke all on function public.submit_review(uuid, smallint, text) from public, anon;
grant execute on function public.submit_review(uuid, smallint, text) to authenticated;

-- Média e contagem geral da loja, para exibir nas telas públicas.
create or replace view public.review_stats as
  select
    count(*)::integer as total_reviews,
    coalesce(round(avg(rating)::numeric, 2), 0) as average_rating,
    count(*) filter (where rating = 5)::integer as star_5,
    count(*) filter (where rating = 4)::integer as star_4,
    count(*) filter (where rating = 3)::integer as star_3,
    count(*) filter (where rating = 2)::integer as star_2,
    count(*) filter (where rating = 1)::integer as star_1
  from public.reviews;

grant select on public.review_stats to anon, authenticated;

commit;
