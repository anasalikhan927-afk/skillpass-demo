-- SkillPass TL — cloud register tables
-- Paste all of this into Supabase → SQL Editor → New query, then press Run.

create table if not exists public.trainees (
  id          text primary key,
  licence     text unique not null,
  name        text not null,
  dob         date,
  phone       text,
  mun         text,
  employer    text,
  classes     text[] not null default '{}',
  issued      date,
  status      text not null default 'Pending assessment',
  face        jsonb,          -- face template(s) used for check-in
  photo       text,           -- small licence photo (JPEG data URL)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.checkins (
  cid         text primary key,
  trainee_id  text not null references public.trainees(id) on delete cascade,
  site        text,
  method      text,
  score       text,
  date        date,
  time        text,
  session     text,
  created_at  timestamptz not null default now()
);

create index if not exists checkins_trainee_idx on public.checkins (trainee_id);

-- DEMO ACCESS RULES
-- Anyone with the app link can read and add records. Fine for a demo with test data.
-- Before using real trainees, replace these with staff logins (Supabase Auth) and stricter rules.
alter table public.trainees enable row level security;
alter table public.checkins enable row level security;

drop policy if exists "demo read trainees"   on public.trainees;
drop policy if exists "demo add trainees"    on public.trainees;
drop policy if exists "demo update trainees" on public.trainees;
drop policy if exists "demo read checkins"   on public.checkins;
drop policy if exists "demo add checkins"    on public.checkins;
drop policy if exists "demo update checkins" on public.checkins;

create policy "demo read trainees"   on public.trainees for select to anon using (true);
create policy "demo add trainees"    on public.trainees for insert to anon with check (true);
create policy "demo update trainees" on public.trainees for update to anon using (true) with check (true);
create policy "demo read checkins"   on public.checkins for select to anon using (true);
create policy "demo add checkins"    on public.checkins for insert to anon with check (true);
create policy "demo update checkins" on public.checkins for update to anon using (true) with check (true);

grant select, insert, update on public.trainees to anon;
grant select, insert, update on public.checkins to anon;
