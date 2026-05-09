-- ============================================================================
-- CondoApp — schema inicial
-- Rode no SQL editor do Supabase (uma vez por projeto)
-- ============================================================================

-- Lista oficial de moradores (fonte de verdade, NUNCA exposta ao cliente)
create table if not exists residents_roster (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  normalized_name text not null,
  unit text not null,
  normalized_unit text not null,
  created_at timestamptz not null default now()
);
create index if not exists residents_roster_unit_idx on residents_roster (normalized_unit);
create index if not exists residents_roster_name_idx on residents_roster (normalized_name);

-- Catálogo de interesses
create table if not exists interests (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  subcategory text,
  name text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  unique (category, name)
);
create index if not exists interests_category_idx on interests (category) where active = true;

-- Perfis (quem respondeu)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  normalized_name text not null,
  unit text not null,
  normalized_unit text not null,
  age_band text not null check (age_band in ('0-3','4-7','8-12','13-17','18-29','30-49','50+')),
  gender text not null check (gender in ('feminino','masculino','outro')),
  matched_roster_id uuid references residents_roster(id),
  status text not null default 'pending' check (status in ('verified','pending','rejected')),
  parent_profile_id uuid references profiles(id),
  session_token text,
  submitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_session_idx on profiles (session_token);
create index if not exists profiles_status_idx on profiles (status);
create index if not exists profiles_unit_idx on profiles (normalized_unit);

-- Interesses por perfil (N:N)
create table if not exists profile_interests (
  profile_id uuid not null references profiles(id) on delete cascade,
  interest_id uuid not null references interests(id) on delete cascade,
  affinity text not null default 'curious' check (affinity in ('curious','practitioner','teacher')),
  primary key (profile_id, interest_id)
);
create index if not exists profile_interests_interest_idx on profile_interests (interest_id);

-- Disponibilidade semanal (até 28 linhas por perfil — 7 dias × 4 turnos)
create table if not exists availability (
  profile_id uuid not null references profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=domingo
  time_slot text not null check (time_slot in ('morning','afternoon','evening','dawn')),
  primary key (profile_id, day_of_week, time_slot)
);
create index if not exists availability_slot_idx on availability (day_of_week, time_slot);

-- Trigger para updated_at em profiles
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

-- ============================================================================
-- RLS — defesa em profundidade. Toda escrita deve passar pela service role
-- (server-side). Cliente público nunca lê dados crus.
-- ============================================================================

alter table residents_roster enable row level security;
alter table profiles enable row level security;
alter table profile_interests enable row level security;
alter table availability enable row level security;
alter table interests enable row level security;

-- Catálogo de interesses: leitura pública dos ativos
drop policy if exists interests_public_read on interests;
create policy interests_public_read on interests
  for select using (active = true);

-- Tudo o mais: bloquear leitura/escrita anônima por padrão.
-- O servidor usa service_role (que ignora RLS) para operações controladas.
