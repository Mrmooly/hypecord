-- Hypecord Beta backend additions.
-- These statements are already applied to project amlcettmddscluxffgpo.

create table if not exists public.hypecord_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Hypecord User', bio text not null default '',
  status text not null default 'online', avatar text, banner text, dm_cover text,
  nameplate text, frame text, effect text, decoration text, badge text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.hypecord_servers (
  id text primary key, name text not null, avatar text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.hypecord_server_members (
  server_id text not null references public.hypecord_servers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  can_manage boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (server_id, user_id)
);

create table if not exists public.hypecord_server_invites (
  id uuid primary key default gen_random_uuid(),
  server_id text not null references public.hypecord_servers(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), expires_at timestamptz,
  max_uses integer, uses integer not null default 0
);

-- The live project also has RLS policies limiting these tables to authenticated users,
-- server members/managers, and profile owners, plus private Realtime policies for
-- hypecord-voice:<server>:Lounge channels.
-- See the Supabase migration history for the complete policy definitions.


-- Beta tester entitlement: users who register during the 60-day beta window keep the badge permanently.
alter table public.hypecord_profiles add column if not exists beta_tester boolean not null default false;
alter table public.hypecord_profiles add column if not exists beta_registered_at timestamptz;

update public.hypecord_profiles p
set beta_tester = true, beta_registered_at = coalesce(p.beta_registered_at, u.created_at)
from auth.users u
where p.user_id = u.id
  and u.created_at >= timestamptz '2026-09-01 06:00:00+00'
  and u.created_at <= timestamptz '2026-10-31 05:59:59+00';
