-- =====================================================================
-- Historial de aprendizaje (tanda 1) - 2026-11-10
-- NO APLICADA. Revisar antes de ejecutar (supabase db push o SQL editor).
--
-- 1. Columnas de identidad y contexto en learning_events / learning_profile
-- 2. Politicas RLS: cada usuario autenticado inserta y lee solo lo suyo
--    (por user_id o por child_profiles.parent_id)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Esquema
-- ---------------------------------------------------------------------

alter table public.learning_events
  add column if not exists child_id uuid null
    references public.child_profiles(id) on delete cascade,
  add column if not exists subject  text null,
  add column if not exists topic    text null,
  add column if not exists task_id  text null;

alter table public.learning_profile
  add column if not exists child_id uuid null
    references public.child_profiles(id) on delete cascade;

create index if not exists learning_events_user_id_idx   on public.learning_events (user_id);
create index if not exists learning_events_child_id_idx  on public.learning_events (child_id);
create index if not exists learning_events_device_id_idx on public.learning_events (device_id);
create index if not exists learning_profile_user_id_idx  on public.learning_profile (user_id);
create index if not exists learning_profile_child_id_idx on public.learning_profile (child_id);

-- ---------------------------------------------------------------------
-- 2. Funcion auxiliar: el usuario actual es padre/madre del nino?
--    security definer para no depender de la RLS de child_profiles.
-- ---------------------------------------------------------------------

create or replace function public.is_parent_of(p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.child_profiles c
    where c.id = p_child_id
      and c.parent_id = auth.uid()
  );
$$;

revoke all on function public.is_parent_of(uuid) from public;
grant execute on function public.is_parent_of(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------

alter table public.learning_events  enable row level security;
alter table public.learning_profile enable row level security;

-- Elimina TODAS las politicas previas de estas dos tablas (no estan versionadas
-- en el repo y una politica permisiva antigua anularia las nuevas).
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('learning_events', 'learning_profile')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end
$$;

-- ---- learning_events: usuario autenticado --------------------------

create policy learning_events_select_own
  on public.learning_events for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (child_id is not null and public.is_parent_of(child_id))
  );

create policy learning_events_insert_own
  on public.learning_events for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (child_id is null or public.is_parent_of(child_id))
  );

create policy learning_events_delete_own
  on public.learning_events for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or (child_id is not null and public.is_parent_of(child_id))
  );

-- ---- learning_profile: usuario autenticado -------------------------

create policy learning_profile_select_own
  on public.learning_profile for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (child_id is not null and public.is_parent_of(child_id))
  );

create policy learning_profile_insert_own
  on public.learning_profile for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (child_id is null or public.is_parent_of(child_id))
  );

-- Permite ademas "reclamar" la fila anonima del dispositivo (user_id null)
-- cuando el usuario inicia sesion y vuelve a dar consentimiento.
create policy learning_profile_update_own
  on public.learning_profile for update
  to authenticated
  using (
    user_id = (select auth.uid())
    or (child_id is not null and public.is_parent_of(child_id))
    or (user_id is null and child_id is null)
  )
  with check (
    user_id = (select auth.uid())
    and (child_id is null or public.is_parent_of(child_id))
  );

create policy learning_profile_delete_own
  on public.learning_profile for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or (child_id is not null and public.is_parent_of(child_id))
  );

-- ---------------------------------------------------------------------
-- 4. OPCIONAL - modo anonimo (sin sesion, solo device_id)
--    Hoy la app permite usar Lumi sin login. Sin estas politicas, un nino
--    sin sesion no podra guardar consentimiento ni eventos.
--    Riesgo: device_id no se puede verificar en RLS, asi que cualquiera con
--    la anon key podria leer/editar filas anonimas (sin datos personales).
--    Borrar este bloque si se decide exigir login.
-- ---------------------------------------------------------------------

create policy learning_events_insert_anon
  on public.learning_events for insert
  to anon
  with check (user_id is null and child_id is null);

create policy learning_profile_select_anon
  on public.learning_profile for select
  to anon
  using (user_id is null and child_id is null);

create policy learning_profile_insert_anon
  on public.learning_profile for insert
  to anon
  with check (user_id is null and child_id is null);

create policy learning_profile_update_anon
  on public.learning_profile for update
  to anon
  using (user_id is null and child_id is null)
  with check (user_id is null and child_id is null);

-- Nota: compute-profile usa service_role y no esta sujeto a RLS.
