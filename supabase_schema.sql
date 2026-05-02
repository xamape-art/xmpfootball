-- ============================================================
-- XMP Football Analysis — Schema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Tabla de jugadoras
create table if not exists public.players (
  id                  text primary key,
  name                text not null,
  photo_url           text,
  team                text not null,
  position            text not null check (position in ('delantera', 'extremo')),
  side                text check (side in ('derecha', 'izquierda', 'ambos')),
  age                 integer,
  nationality         text,
  email               text,
  phone               text,
  trial_start_date    date not null,
  subscription_status text not null default 'trial'
                        check (subscription_status in ('trial', 'active', 'inactive')),
  notes               text,
  created_at          timestamptz not null default now()
);

-- Tabla de análisis
create table if not exists public.analyses (
  id                    text primary key,
  player_id             text not null references public.players(id) on delete cascade,
  date                  date not null,
  match_info            jsonb not null default '{}',
  video_url             text,
  phase                 text not null check (phase in ('ofensivo', 'defensivo', 'ambos')),
  offensive_ratings     jsonb not null default '[]',
  defensive_ratings     jsonb not null default '[]',
  general_observations  text,
  strengths             jsonb not null default '[]',
  improvements          jsonb not null default '[]',
  next_match_focus      text,
  overall_rating        numeric(4,2) not null default 0,
  created_at            timestamptz not null default now()
);

-- Índices para consultas frecuentes
create index if not exists analyses_player_id_idx on public.analyses(player_id);
create index if not exists analyses_date_idx on public.analyses(date desc);
create index if not exists players_created_at_idx on public.players(created_at desc);

-- Row Level Security (acceso público — sin autenticación por ahora)
alter table public.players  enable row level security;
alter table public.analyses enable row level security;

-- Políticas de acceso total (ajustar cuando se añada autenticación)
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'players' and policyname = 'public_all_players'
  ) then
    create policy "public_all_players"
      on public.players for all
      using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'analyses' and policyname = 'public_all_analyses'
  ) then
    create policy "public_all_analyses"
      on public.analyses for all
      using (true) with check (true);
  end if;
end $$;
