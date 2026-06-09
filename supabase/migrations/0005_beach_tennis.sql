-- ============================================================================
-- 0005 — Beach Tennis: planejador colaborativo de 3 dias
-- App separado do condomínio. Tabelas com prefixo bt_.
-- Rode no SQL editor do Supabase (uma vez por projeto).
-- ============================================================================

-- Participantes (as amigas). Sem senha — só o nome.
create table if not exists bt_participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null unique,
  session_token text,
  created_at timestamptz not null default now()
);
create index if not exists bt_participants_name_idx on bt_participants (normalized_name);

-- Marcações por dia. Uma linha por (participante, dia).
--   kind = 'free'    → 100% livre (bloco de 3 dias consecutivos)
--   kind = 'maybe'   → consigo me esforçar pra ficar livre (bloco de 3 dias)
--   kind = 'blocked' → 100% indisponível (1 ou mais dias)
-- block_id agrupa os dias marcados juntos, pra dar pra remover o bloco inteiro.
create table if not exists bt_marks (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references bt_participants(id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('free','maybe','blocked')),
  block_id uuid not null,
  created_at timestamptz not null default now(),
  unique (participant_id, day)
);
create index if not exists bt_marks_day_idx on bt_marks (day);
create index if not exists bt_marks_participant_idx on bt_marks (participant_id);
create index if not exists bt_marks_block_idx on bt_marks (block_id);

-- ============================================================================
-- RLS — toda escrita passa pela service role (server-side), como no app do condo.
-- ============================================================================
alter table bt_participants enable row level security;
alter table bt_marks enable row level security;
