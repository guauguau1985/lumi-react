-- Lumi Pro: aprendizaje para adultos (cuentas con role = 'parent').
-- Tablas nuevas y aisladas: no modifica nada de lo que usan los niños.
-- El contenido de las lecciones vive en el código (src/modules/pro/data);
-- aquí solo se guarda el avance de cada persona.

-- Preferencias de cada adulto: su área de trabajo y su plan "si-entonces".
create table if not exists public.pro_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  area text not null default 'general',
  plan_cuando text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Avance por lección: cuándo la terminó y qué escribió en la práctica.
create table if not exists public.pro_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  practice_text text,
  mini_task_reported text,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Repaso espaciado: cada pregunta vuelve a los 1, 3, 7 y 21 días.
-- box = 0..4 (0 = recién vista); due_on = fecha en que vuelve a aparecer.
create table if not exists public.pro_reviews (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  lesson_id text not null,
  box smallint not null default 0 check (box between 0 and 4),
  due_on date not null default (current_date + 1),
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  last_answered_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists pro_reviews_due_idx on public.pro_reviews (user_id, due_on);

-- Días con actividad, para la racha que perdona un día perdido.
create table if not exists public.pro_activity_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  minutes integer not null default 0,
  primary key (user_id, day)
);

alter table public.pro_settings enable row level security;
alter table public.pro_lesson_progress enable row level security;
alter table public.pro_reviews enable row level security;
alter table public.pro_activity_days enable row level security;

-- Cada persona solo ve y modifica sus propias filas.
create policy pro_settings_self_all on public.pro_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy pro_lesson_progress_self_all on public.pro_lesson_progress
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy pro_reviews_self_all on public.pro_reviews
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy pro_activity_days_self_all on public.pro_activity_days
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Minutos que la persona dice haberse ahorrado al aplicar la mini tarea.
alter table public.pro_lesson_progress
  add column if not exists minutes_saved integer
  check (minutes_saved is null or minutes_saved between 0 and 600);
