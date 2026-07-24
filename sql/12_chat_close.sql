-- Permite encerrar/reabrir uma conversa de chat. Reabre automaticamente quando qualquer lado manda mensagem nova.
begin;

alter table public.conversations
  add column if not exists status text not null default 'open' check (status in ('open','closed'));

commit;
