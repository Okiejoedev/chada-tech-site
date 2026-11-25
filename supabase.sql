-- =====================================================================
-- Chada Tech website: run ONCE in Supabase → SQL Editor → New query → Run
-- (Same SQL as the build plan, plus a `source` column on each table for UTM tracking
--  and explicit grants so the website's anon key can insert.)
-- =====================================================================

-- Free class registrations
create table public.class_registrations (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,                 -- e.g. 'free-2026-11-28'
  full_name text not null check (char_length(full_name) between 2 and 80),
  whatsapp text not null check (whatsapp ~ '^\+234[0-9]{10}$'),
  what_they_do text check (char_length(what_they_do) <= 120),
  email text check (char_length(email) <= 120),
  heard_from text check (char_length(heard_from) <= 40),
  consent_privacy boolean not null check (consent_privacy),
  consent_updates boolean not null default false,
  source text check (char_length(source) <= 60),
  created_at timestamptz not null default now(),
  unique (class_code, whatsapp)
);

-- Inner Circle sign-ups and payments
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  track text not null check (track in ('business','professional','student')),
  status text not null default 'pending' check (status in ('pending','paid','waitlist','cancelled','refunded')),
  full_name text not null check (char_length(full_name) between 2 and 80),
  whatsapp text not null check (whatsapp ~ '^\+234[0-9]{10}$'),
  email text check (char_length(email) <= 120),
  what_they_do text check (char_length(what_they_do) <= 120),
  proof_path text,                          -- student proof file in private storage
  founding boolean not null default false,
  consent_privacy boolean not null check (consent_privacy),
  consent_updates boolean not null default false,
  source text check (char_length(source) <= 60),
  paid_at timestamptz,
  renews_on date,
  notes text check (char_length(notes) <= 300),
  created_at timestamptz not null default now()
);

-- Customer Reply Kit leads (no bank details are ever sent here)
create table public.reply_kit_leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 1 and 60),
  whatsapp text not null check (whatsapp ~ '^\+234[0-9]{10}$'),
  business_name text check (char_length(business_name) <= 80),
  what_they_sell text check (char_length(what_they_sell) <= 120),
  city text check (char_length(city) <= 60),
  tone text check (tone in ('friendly','professional','casual')),
  consent_privacy boolean not null check (consent_privacy),
  consent_updates boolean not null default false,
  source text check (char_length(source) <= 60),
  created_at timestamptz not null default now()
);

-- Team admins (add each team member's sign-in email)
create table public.admins (email text primary key);

alter table public.class_registrations enable row level security;
alter table public.memberships enable row level security;
alter table public.reply_kit_leads enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = auth.jwt() ->> 'email');
$$;

-- Table privileges (RLS below still decides which rows)
grant usage on schema public to anon, authenticated;
grant insert on public.class_registrations, public.memberships, public.reply_kit_leads to anon;
grant select, insert, update, delete on public.class_registrations, public.memberships, public.reply_kit_leads to authenticated;
grant select on public.admins to authenticated;

-- Visitors may insert only
create policy anon_insert_class on public.class_registrations for insert to anon with check (true);
create policy anon_insert_member on public.memberships for insert to anon
  with check (status in ('pending','waitlist') and paid_at is null and founding = false);
create policy anon_insert_kit on public.reply_kit_leads for insert to anon with check (true);

-- Admins can read and update everything
create policy admin_all_class on public.class_registrations for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all_member on public.memberships for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all_kit on public.reply_kit_leads for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_read_admins on public.admins for select to authenticated using (public.is_admin());

-- Public count of founding places left (no personal data exposed)
create or replace function public.founding_places_left() returns int
language sql stable security definer set search_path = public as $$
  select greatest(0, 10 - (select count(*) from public.memberships where track = 'business' and status = 'paid'))::int;
$$;
revoke execute on function public.founding_places_left() from public;
grant execute on function public.founding_places_left() to anon, authenticated;

-- Private bucket for student proof uploads (5 MB, JPG/PNG/PDF only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-proofs', 'student-proofs', false, 5242880, array['image/jpeg','image/png','application/pdf']);
create policy anon_upload_proof on storage.objects for insert to anon with check (bucket_id = 'student-proofs');
create policy admin_read_proof on storage.objects for select to authenticated using (bucket_id = 'student-proofs' and public.is_admin());

-- ---------------------------------------------------------------------
-- LAST STEP: add the team's sign-in emails (CONFIRM: Joseph and Ope)
-- insert into public.admins (email) values ('joseph@example.com'), ('ope@example.com');
-- ---------------------------------------------------------------------
