-- Banners administráveis: promoção, novidade, aviso ou evento. Exibidos no topo do site quando ativos e dentro do período.
begin;

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('promo','news','notice','event')),
  title text not null,
  message text not null default '',
  link_url text,
  image_url text,
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists banners_active_idx on public.banners (active, position);

alter table public.banners enable row level security;

drop policy if exists "active banners are public" on public.banners;
create policy "active banners are public" on public.banners for select using (
  active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

commit;
