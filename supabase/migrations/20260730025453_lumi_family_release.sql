-- Lumi family release
-- Account-scoped learning history, parent/child linking, homework workspace,
-- private file storage, and persistent gamification.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles and family relationships
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists role text not null default 'student',
  add column if not exists grade text,
  add column if not exists avatar_key text,
  add column if not exists parent_email text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('student', 'parent'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_grade_check'
  ) then
    alter table public.profiles
      add constraint profiles_grade_check check (
        grade is null or grade in (
          '5-basico', '6-basico', '7-basico', '8-basico', '1-medio'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_avatar_check'
  ) then
    alter table public.profiles
      add constraint profiles_avatar_check check (
        avatar_key is null or avatar_key in ('girl', 'boy')
      );
  end if;
end
$$;

create table if not exists public.family_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null,
  child_id uuid not null,
  created_at timestamptz not null default now(),
  unique (parent_id, child_id),
  check (parent_id <> child_id)
);

create index if not exists family_links_parent_idx
  on public.family_links(parent_id);
create index if not exists family_links_child_idx
  on public.family_links(child_id);
create index if not exists profiles_parent_email_idx
  on public.profiles(lower(parent_email))
  where parent_email is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'family_links_parent_fkey'
  ) then
    alter table public.family_links
      add constraint family_links_parent_fkey
      foreign key (parent_id) references auth.users(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'family_links_child_fkey'
  ) then
    alter table public.family_links
      add constraint family_links_child_fkey
      foreign key (child_id) references auth.users(id) on delete cascade;
  end if;
end
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_role text;
begin
  profile_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  if profile_role not in ('student', 'parent') then
    profile_role := 'student';
  end if;

  insert into public.profiles (
    id,
    email,
    nombre,
    role,
    grade,
    avatar_key,
    parent_email,
    updated_at
  )
  values (
    new.id,
    lower(new.email),
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    profile_role,
    nullif(new.raw_user_meta_data->>'grade', ''),
    nullif(new.raw_user_meta_data->>'avatar_key', ''),
    nullif(lower(trim(new.raw_user_meta_data->>'parent_email')), ''),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    nombre = coalesce(excluded.nombre, public.profiles.nombre),
    role = excluded.role,
    grade = coalesce(excluded.grade, public.profiles.grade),
    avatar_key = coalesce(excluded.avatar_key, public.profiles.avatar_key),
    parent_email = coalesce(excluded.parent_email, public.profiles.parent_email),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Bring pre-existing Auth accounts into the same account-scoped profile model.
-- No credentials or family emails are embedded in this migration.
insert into public.profiles (
  id, email, nombre, role, grade, avatar_key, parent_email, updated_at
)
select
  u.id,
  lower(u.email),
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'nombre'), ''),
    split_part(lower(u.email), '@', 1)
  ),
  case
    when u.raw_user_meta_data->>'role' = 'parent' then 'parent'
    else 'student'
  end,
  nullif(u.raw_user_meta_data->>'grade', ''),
  nullif(u.raw_user_meta_data->>'avatar_key', ''),
  nullif(lower(trim(u.raw_user_meta_data->>'parent_email')), ''),
  now()
from auth.users u
where u.email is not null
on conflict (id) do update set
  email = excluded.email,
  nombre = coalesce(public.profiles.nombre, excluded.nombre),
  updated_at = now();

create or replace function public.link_profile_family()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'student' and new.parent_email is not null then
    insert into public.family_links (parent_id, child_id)
    select p.id, new.id
    from public.profiles p
    where p.role = 'parent'
      and lower(p.email) = lower(new.parent_email)
    on conflict (parent_id, child_id) do nothing;
  elsif new.role = 'parent' then
    insert into public.family_links (parent_id, child_id)
    select new.id, c.id
    from public.profiles c
    where c.role = 'student'
      and c.parent_email is not null
      and lower(c.parent_email) = lower(new.email)
    on conflict (parent_id, child_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_link_family on public.profiles;
create trigger profiles_link_family
  after insert or update of parent_email, email, role on public.profiles
  for each row execute function public.link_profile_family();

create or replace function public.claim_family_links()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_count integer;
  requester_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select lower(email) into requester_email
  from public.profiles
  where id = auth.uid() and role = 'parent';

  if requester_email is null then
    raise exception 'Parent account required';
  end if;

  with inserted as (
    insert into public.family_links (parent_id, child_id)
    select auth.uid(), c.id
    from public.profiles c
    where c.role = 'student'
      and lower(c.parent_email) = requester_email
    on conflict (parent_id, child_id) do nothing
    returning 1
  )
  select count(*) into linked_count from inserted;

  return linked_count;
end;
$$;

grant execute on function public.claim_family_links() to authenticated;

-- ---------------------------------------------------------------------------
-- Homework workspace
-- ---------------------------------------------------------------------------

create table if not exists public.homework_tasks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null,
  title text not null default 'Nueva tarea',
  subject text not null,
  grade text not null,
  file_name text,
  file_path text,
  file_type text,
  extracted_text text,
  instructions_summary text,
  checklist jsonb not null default '[]'::jsonb,
  status text not null default 'in_progress',
  current_stage smallint not null default 1,
  points_earned integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (subject in (
    'matematicas', 'ciencias', 'ingles', 'historia',
    'lenguaje', 'tecnologia', 'robotica', 'otra'
  )),
  check (grade in (
    '5-basico', '6-basico', '7-basico', '8-basico', '1-medio'
  )),
  check (status in ('in_progress', 'completed', 'archived')),
  check (current_stage between 1 and 4),
  check (points_earned between 0 and 500)
);

create index if not exists homework_tasks_child_created_idx
  on public.homework_tasks(child_id, created_at desc);

create table if not exists public.homework_messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.homework_tasks(id) on delete cascade,
  child_id uuid not null,
  role text not null,
  content text not null,
  message_kind text not null default 'chat',
  created_at timestamptz not null default now(),
  check (role in ('student', 'tutor')),
  check (message_kind in ('chat', 'summary', 'draft', 'review', 'system'))
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'homework_tasks_child_fkey'
  ) then
    alter table public.homework_tasks
      add constraint homework_tasks_child_fkey
      foreign key (child_id) references auth.users(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'homework_messages_child_fkey'
  ) then
    alter table public.homework_messages
      add constraint homework_messages_child_fkey
      foreign key (child_id) references auth.users(id) on delete cascade;
  end if;
end
$$;

create index if not exists homework_messages_task_created_idx
  on public.homework_messages(task_id, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists homework_tasks_touch_updated_at on public.homework_tasks;
create trigger homework_tasks_touch_updated_at
  before update on public.homework_tasks
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Account-scoped learning and gamification
-- ---------------------------------------------------------------------------

alter table public.learning_events
  add column if not exists topic text,
  add column if not exists subject text,
  add column if not exists task_id uuid;

alter table public.learning_events
  drop constraint if exists learning_events_modulo_check;
alter table public.learning_events
  add constraint learning_events_modulo_check check (
    modulo is null or modulo in (
      'math', 'eco', 'naturales', 'coder', 'ai', 'tarea',
      'lenguaje', 'ingles', 'historia', 'tecnologia'
    )
  );

create index if not exists learning_events_user_created_idx
  on public.learning_events(user_id, created_at desc);
create unique index if not exists learning_profile_user_unique_idx
  on public.learning_profile(user_id)
  where user_id is not null;

create table if not exists public.gamification_profiles (
  user_id uuid primary key,
  xp_total integer not null default 0,
  coins integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  last_active_date date,
  badges jsonb not null default '[]'::jsonb,
  module_progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  check (xp_total >= 0),
  check (coins >= 0),
  check (level >= 1)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'gamification_profiles_user_fkey'
  ) then
    alter table public.gamification_profiles
      add constraint gamification_profiles_user_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end
$$;

alter table public.user_streaks
  drop constraint if exists user_streaks_device_id_key;
alter table public.weekly_league
  drop constraint if exists weekly_league_device_id_semana_key;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_streaks_user_id_key'
  ) then
    alter table public.user_streaks
      add constraint user_streaks_user_id_key unique (user_id);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'weekly_league_user_week_key'
  ) then
    alter table public.weekly_league
      add constraint weekly_league_user_week_key unique (user_id, semana);
  end if;
end
$$;

create or replace function public.add_game_rewards(
  p_xp integer,
  p_coins integer,
  p_module text default null
)
returns public.gamification_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.gamification_profiles;
  safe_xp integer := greatest(0, least(coalesce(p_xp, 0), 100));
  safe_coins integer := greatest(0, least(coalesce(p_coins, 0), 25));
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.gamification_profiles (
    user_id, xp_total, coins, level, last_active_date, updated_at
  )
  values (
    auth.uid(),
    safe_xp,
    safe_coins,
    floor(safe_xp / 100.0)::integer + 1,
    current_date,
    now()
  )
  on conflict (user_id) do update set
    xp_total = public.gamification_profiles.xp_total + safe_xp,
    coins = public.gamification_profiles.coins + safe_coins,
    level = floor((public.gamification_profiles.xp_total + safe_xp) / 100.0)::integer + 1,
    streak_days = case
      when public.gamification_profiles.last_active_date = current_date
        then public.gamification_profiles.streak_days
      when public.gamification_profiles.last_active_date = current_date - 1
        then public.gamification_profiles.streak_days + 1
      else 1
    end,
    last_active_date = current_date,
    module_progress = case
      when p_module is null then public.gamification_profiles.module_progress
      else jsonb_set(
        public.gamification_profiles.module_progress,
        array[p_module],
        to_jsonb(
          coalesce(
            (public.gamification_profiles.module_progress ->> p_module)::integer,
            0
          ) + safe_xp
        ),
        true
      )
    end,
    updated_at = now()
  returning * into result;

  return result;
end;
$$;

grant execute on function public.add_game_rewards(integer, integer, text)
  to authenticated;

create or replace function public.add_weekly_xp(
  p_xp integer,
  p_alias text,
  p_device_id text,
  p_week text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  safe_xp integer := greatest(0, least(coalesce(p_xp, 0), 100));
  safe_alias text := left(regexp_replace(coalesce(p_alias, 'Lumi'), '[^[:alnum:]ÁÉÍÓÚÜÑáéíóúüñ]', '', 'g'), 40);
begin
  if auth.uid() is null or p_week !~ '^[0-9]{4}-W[0-9]{2}$' then
    raise exception 'Invalid request';
  end if;

  insert into public.weekly_league (
    user_id, device_id, alias, xp_semanal, semana
  )
  values (
    auth.uid(), left(p_device_id, 100), safe_alias, safe_xp, p_week
  )
  on conflict (user_id, semana) do update set
    xp_semanal = public.weekly_league.xp_semanal + safe_xp,
    alias = excluded.alias,
    device_id = excluded.device_id;
end;
$$;

grant execute on function public.add_weekly_xp(integer, text, text, text)
  to authenticated;

create or replace function public.merge_device_history(p_device_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_device_id is null or length(p_device_id) < 8 then
    raise exception 'Invalid request';
  end if;

  update public.learning_events
    set user_id = auth.uid()
    where device_id = p_device_id and user_id is null;
  update public.learning_profile
    set user_id = auth.uid()
    where device_id = p_device_id and user_id is null;
  update public.chat_history
    set user_id = auth.uid()
    where device_id = p_device_id and user_id is null;
  update public.lesson_sessions
    set user_id = auth.uid()
    where device_id = p_device_id and user_id is null;
end;
$$;

grant execute on function public.merge_device_history(text) to authenticated;

create or replace function public.set_child_learning_enabled(
  p_child_id uuid,
  p_enabled boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.family_links
    where parent_id = auth.uid() and child_id = p_child_id
  ) then
    raise exception 'Parent access required';
  end if;

  insert into public.learning_profile (
    user_id,
    device_id,
    perfil_habilitado,
    data_confidence,
    total_eventos,
    strengths,
    difficulties,
    bloqueo_detectado,
    last_updated
  )
  values (
    p_child_id,
    'user:' || p_child_id::text,
    p_enabled,
    'baja',
    0,
    '{}',
    '{}',
    '{}',
    now()
  )
  on conflict (user_id) where user_id is not null do update set
    perfil_habilitado = excluded.perfil_habilitado,
    last_updated = now();
end;
$$;

grant execute on function public.set_child_learning_enabled(uuid, boolean)
  to authenticated;

create or replace function public.delete_child_learning_data(p_child_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.family_links
    where parent_id = auth.uid() and child_id = p_child_id
  ) then
    raise exception 'Parent access required';
  end if;

  delete from public.homework_messages where child_id = p_child_id;
  delete from public.homework_tasks where child_id = p_child_id;
  delete from public.chat_history where user_id = p_child_id;
  delete from public.learning_events where user_id = p_child_id;
  delete from public.learning_profile where user_id = p_child_id;
  delete from public.lesson_sessions where user_id = p_child_id;
  delete from public.gamification_profiles where user_id = p_child_id;
end;
$$;

grant execute on function public.delete_child_learning_data(uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.family_links enable row level security;
alter table public.homework_tasks enable row level security;
alter table public.homework_messages enable row level security;
alter table public.gamification_profiles enable row level security;
alter table public.learning_events enable row level security;
alter table public.learning_profile enable row level security;
alter table public.chat_history enable row level security;
alter table public.lesson_sessions enable row level security;

-- Remove historical anonymous/device-wide policies before adding account-scoped
-- rules. PostgreSQL combines permissive policies with OR, so leaving any one of
-- these in place would expose family learning data.
drop policy if exists "learning_events_insert" on public.learning_events;
drop policy if exists "learning_events_select_own" on public.learning_events;
drop policy if exists "insert_learning_events" on public.learning_events;
drop policy if exists "learning_profile_insert" on public.learning_profile;
drop policy if exists "learning_profile_update_own" on public.learning_profile;
drop policy if exists "learning_profile_select_own" on public.learning_profile;
drop policy if exists "insert_learning_profile" on public.learning_profile;
drop policy if exists "update_learning_profile" on public.learning_profile;
drop policy if exists "select_learning_profile" on public.learning_profile;
drop policy if exists "insert_lesson_sessions" on public.lesson_sessions;
drop policy if exists "select_lesson_sessions" on public.lesson_sessions;
drop policy if exists "insert_chat_history" on public.chat_history;
drop policy if exists "select_chat_history" on public.chat_history;
drop policy if exists "insert_profiles" on public.profiles;
drop policy if exists "select_profiles" on public.profiles;
drop policy if exists "update_profiles" on public.profiles;
drop policy if exists "insert_child_profiles" on public.child_profiles;
drop policy if exists "select_child_profiles" on public.child_profiles;

drop policy if exists child_profiles_parent_all on public.child_profiles;
create policy child_profiles_parent_all on public.child_profiles
for all to authenticated
using (parent_id = auth.uid())
with check (parent_id = auth.uid());

drop policy if exists profiles_select_family on public.profiles;
create policy profiles_select_family on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.family_links f
    where f.parent_id = auth.uid() and f.child_id = profiles.id
  )
);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists family_links_select_members on public.family_links;
create policy family_links_select_members on public.family_links
for select to authenticated
using (parent_id = auth.uid() or child_id = auth.uid());

drop policy if exists homework_tasks_child_all on public.homework_tasks;
create policy homework_tasks_child_all on public.homework_tasks
for all to authenticated
using (child_id = auth.uid())
with check (child_id = auth.uid());

drop policy if exists homework_tasks_parent_read on public.homework_tasks;
create policy homework_tasks_parent_read on public.homework_tasks
for select to authenticated
using (
  exists (
    select 1 from public.family_links f
    where f.parent_id = auth.uid() and f.child_id = homework_tasks.child_id
  )
);

drop policy if exists homework_messages_child_all on public.homework_messages;
create policy homework_messages_child_all on public.homework_messages
for all to authenticated
using (child_id = auth.uid())
with check (
  child_id = auth.uid()
  and exists (
    select 1 from public.homework_tasks t
    where t.id = homework_messages.task_id and t.child_id = auth.uid()
  )
);

drop policy if exists homework_messages_parent_read on public.homework_messages;
create policy homework_messages_parent_read on public.homework_messages
for select to authenticated
using (
  exists (
    select 1 from public.family_links f
    where f.parent_id = auth.uid() and f.child_id = homework_messages.child_id
  )
);

drop policy if exists gamification_self_all on public.gamification_profiles;
create policy gamification_self_all on public.gamification_profiles
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists gamification_parent_read on public.gamification_profiles;
create policy gamification_parent_read on public.gamification_profiles
for select to authenticated
using (
  exists (
    select 1 from public.family_links f
    where f.parent_id = auth.uid() and f.child_id = gamification_profiles.user_id
  )
);

drop policy if exists learning_events_child_all on public.learning_events;
create policy learning_events_child_all on public.learning_events
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists learning_events_parent_read on public.learning_events;
create policy learning_events_parent_read on public.learning_events
for select to authenticated
using (
  exists (
    select 1 from public.family_links f
    where f.parent_id = auth.uid() and f.child_id = learning_events.user_id
  )
);

drop policy if exists learning_profile_child_all on public.learning_profile;
create policy learning_profile_child_all on public.learning_profile
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists learning_profile_parent_read on public.learning_profile;
create policy learning_profile_parent_read on public.learning_profile
for select to authenticated
using (
  exists (
    select 1 from public.family_links f
    where f.parent_id = auth.uid() and f.child_id = learning_profile.user_id
  )
);

drop policy if exists chat_history_child_all on public.chat_history;
create policy chat_history_child_all on public.chat_history
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists chat_history_parent_read on public.chat_history;
create policy chat_history_parent_read on public.chat_history
for select to authenticated
using (
  exists (
    select 1 from public.family_links f
    where f.parent_id = auth.uid() and f.child_id = chat_history.user_id
  )
);

drop policy if exists lesson_sessions_child_all on public.lesson_sessions;
create policy lesson_sessions_child_all on public.lesson_sessions
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists lesson_sessions_parent_read on public.lesson_sessions;
create policy lesson_sessions_parent_read on public.lesson_sessions
for select to authenticated
using (
  exists (
    select 1 from public.family_links f
    where f.parent_id = auth.uid() and f.child_id = lesson_sessions.user_id
  )
);

-- Legacy gamification tables are retained for the anonymous leaderboard UI,
-- but all writes are tied to the authenticated account.
drop policy if exists "select_user_streaks" on public.user_streaks;
drop policy if exists "insert_user_streaks" on public.user_streaks;
drop policy if exists "update_user_streaks" on public.user_streaks;
drop policy if exists "select_weekly_league" on public.weekly_league;
drop policy if exists "insert_weekly_league" on public.weekly_league;
drop policy if exists "update_weekly_league" on public.weekly_league;

drop policy if exists user_streaks_self_all on public.user_streaks;
create policy user_streaks_self_all on public.user_streaks
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists weekly_league_authenticated_read on public.weekly_league;
create policy weekly_league_authenticated_read on public.weekly_league
for select to authenticated
using (true);

drop policy if exists weekly_league_self_insert on public.weekly_league;
create policy weekly_league_self_insert on public.weekly_league
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists weekly_league_self_update on public.weekly_league;
create policy weekly_league_self_update on public.weekly_league
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Private storage for homework files
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'homework-files',
  'homework-files',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists homework_files_child_insert on storage.objects;
create policy homework_files_child_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'homework-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists homework_files_family_select on storage.objects;
create policy homework_files_family_select on storage.objects
for select to authenticated
using (
  bucket_id = 'homework-files'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.family_links f
      where f.parent_id = auth.uid()
        and f.child_id::text = (storage.foldername(name))[1]
    )
  )
);

drop policy if exists homework_files_child_delete on storage.objects;
create policy homework_files_child_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'homework-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);
