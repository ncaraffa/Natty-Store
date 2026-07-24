-- Chat privado 1:1 entre cada cliente e a administradora. Uma conversa por cliente (canal de suporte
-- contínuo, não por pedido). RLS garante que um cliente nunca veja a conversa de outro; o admin acessa
-- tudo via service_role (bypassa RLS), como já é o padrão do resto do admin desta loja.
begin;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customers(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  unread_by_customer boolean not null default false,
  unread_by_admin boolean not null default false
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_role text not null check (sender_role in ('customer','admin')),
  body text,
  image_url text,
  created_at timestamptz not null default now(),
  check (body is not null or image_url is not null)
);

create index if not exists chat_messages_conversation_idx on public.chat_messages (conversation_id, created_at);
create index if not exists conversations_updated_idx on public.conversations (last_message_at desc nulls last);

alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "customer reads own conversation" on public.conversations;
create policy "customer reads own conversation" on public.conversations for select
  using (customer_id in (select id from public.customers where auth_user_id = auth.uid()));

drop policy if exists "customer creates own conversation" on public.conversations;
create policy "customer creates own conversation" on public.conversations for insert
  with check (customer_id in (select id from public.customers where auth_user_id = auth.uid()));

drop policy if exists "customer marks own conversation read" on public.conversations;
create policy "customer marks own conversation read" on public.conversations for update
  using (customer_id in (select id from public.customers where auth_user_id = auth.uid()))
  with check (customer_id in (select id from public.customers where auth_user_id = auth.uid()));

drop policy if exists "customer reads own messages" on public.chat_messages;
create policy "customer reads own messages" on public.chat_messages for select
  using (conversation_id in (
    select c.id from public.conversations c
    join public.customers cu on cu.id = c.customer_id
    where cu.auth_user_id = auth.uid()
  ));

drop policy if exists "customer sends own messages" on public.chat_messages;
create policy "customer sends own messages" on public.chat_messages for insert
  with check (
    sender_role = 'customer'
    and conversation_id in (
      select c.id from public.conversations c
      join public.customers cu on cu.id = c.customer_id
      where cu.auth_user_id = auth.uid()
    )
  );

commit;
