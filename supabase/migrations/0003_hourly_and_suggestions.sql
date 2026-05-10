-- ============================================================================
-- 0003 — Disponibilidade hora-a-hora, afinidade renomeada, tabela de sugestões
-- ============================================================================

-- Availability: 4 turnos -> 24 horas
drop table if exists availability;
create table availability (
  profile_id uuid not null references profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  hour smallint not null check (hour between 0 and 23),
  primary key (profile_id, day_of_week, hour)
);
create index availability_slot_idx on availability (day_of_week, hour);
alter table availability enable row level security;

-- Affinity: curious/practitioner/teacher -> beginner/intermediate/advanced
alter table profile_interests drop constraint if exists profile_interests_affinity_check;
update profile_interests set affinity = case affinity
  when 'curious' then 'beginner'
  when 'practitioner' then 'intermediate'
  when 'teacher' then 'advanced'
  else 'beginner'
end;
alter table profile_interests alter column affinity set default 'beginner';
alter table profile_interests
  add constraint profile_interests_affinity_check
  check (affinity in ('beginner','intermediate','advanced'));

-- Sugestões de novos interesses (qualquer morador pode sugerir)
create table if not exists interest_suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  profile_id uuid references profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists interest_suggestions_status_idx on interest_suggestions (status);
create index if not exists interest_suggestions_norm_idx on interest_suggestions (normalized_name);
alter table interest_suggestions enable row level security;
