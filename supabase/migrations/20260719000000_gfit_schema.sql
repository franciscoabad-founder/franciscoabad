-- GFIT: modulo de entrenamiento completo (paridad Jefit).
-- Catalogo de ejercicios (seed masivo desde free-exercise-db) + constructor de
-- rutinas/dias/ejercicios/series + registro real de series por sesion.
-- Patron OS (Molde A): RLS habilitado sin politicas, acceso solo via service_role
-- desde endpoints, notify pgrst al final.

-- Nota de compatibilidad: la tabla `sesiones` y `salud_config` ya existen desde
-- la migracion 20260715000000_salud_os_schema.sql (modulo Salud). GFIT se apoya
-- en `sesiones` (no crea una tabla de sesiones propia) y solo le agrega una
-- columna de enlace hacia `gfit_dias`.
--
-- IMPORTANTE (hallazgo real vs. contrato original): `salud_config.unidad_peso`
-- YA EXISTE (creada en 20260715000000_salud_os_schema.sql) con
-- `check (unidad_peso in ('kg','lb'))` -- singular 'lb', no 'lbs'. No se agrega
-- aqui una columna/constraint duplicada; los endpoints de GFIT deben leer/escribir
-- 'kg' | 'lb' (NO 'lbs') en salud_config.unidad_peso para mantener consistencia
-- con el resto del modulo Salud.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ejercicios_catalogo: biblioteca de ejercicios (seed principal: free-exercise-db).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.ejercicios_catalogo (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre_en text not null,
  nombre_es text,
  fuerza text,                                   -- pull | push | static | null
  nivel text,                                     -- beginner | intermediate | expert
  mecanica text,                                  -- compound | isolation | null
  equipo text[] not null default '{}',            -- slugs de gfit_taxonomia (tipo='equipo')
  patron text,                                    -- slug de gfit_taxonomia (tipo='patron')
  -- musculos_primarios / musculos_secundarios: [{ "grupo": "back", "sub": "lats" }, ...]
  musculos_primarios jsonb not null default '[]',
  musculos_secundarios jsonb not null default '[]',
  categoria text,                                 -- categoria original de la fuente (strength, cardio, etc.)
  instrucciones_en text[] default '{}',
  instrucciones_es text[] default '{}',
  imagenes text[] default '{}',                   -- URLs completas a raw.githubusercontent.com
  source text not null default 'free-exercise-db',
  created_at timestamptz default now()
);
create index if not exists ejercicios_catalogo_equipo_idx on public.ejercicios_catalogo using gin (equipo);
create index if not exists ejercicios_catalogo_patron_idx on public.ejercicios_catalogo(patron);
create index if not exists ejercicios_catalogo_musc_primarios_idx on public.ejercicios_catalogo using gin (musculos_primarios);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. gfit_rutinas: planes de entrenamiento (builder GFIT).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.gfit_rutinas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  objetivo text check (objetivo in ('fuerza','hipertrofia','resistencia')) default 'hipertrofia',
  estado text check (estado in ('activa','archivada')) default 'activa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. gfit_dias: dias dentro de una rutina (weekday, orden libre o descanso).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.gfit_dias (
  id uuid primary key default gen_random_uuid(),
  rutina_id uuid not null references public.gfit_rutinas(id) on delete cascade,
  nombre text not null,
  tipo text check (tipo in ('weekday','orden','descanso')) default 'weekday',
  weekday smallint,                    -- 1 = lunes (ISO 8601); null si tipo != 'weekday'
  orden smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gfit_dias_rutina_idx on public.gfit_dias(rutina_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. gfit_dia_ejercicios: ejercicios asignados a un dia (con soporte de superset).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.gfit_dia_ejercicios (
  id uuid primary key default gen_random_uuid(),
  dia_id uuid not null references public.gfit_dias(id) on delete cascade,
  ejercicio_id uuid not null references public.ejercicios_catalogo(id),
  orden smallint not null default 0,
  superset_grupo smallint,             -- mismo valor = enlazados en superset
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gfit_dia_ejercicios_dia_idx on public.gfit_dia_ejercicios(dia_id);
create index if not exists gfit_dia_ejercicios_ejercicio_idx on public.gfit_dia_ejercicios(ejercicio_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. gfit_series_plan: series planificadas por ejercicio-dia (peso/reps/descanso objetivo).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.gfit_series_plan (
  id uuid primary key default gen_random_uuid(),
  dia_ejercicio_id uuid not null references public.gfit_dia_ejercicios(id) on delete cascade,
  orden smallint not null default 0,
  tipo text check (tipo in ('warmup','working','drop','failure')) default 'working',
  peso_kg numeric(6,2),
  reps smallint,
  descanso_s smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gfit_series_plan_dia_ejercicio_idx on public.gfit_series_plan(dia_ejercicio_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. gfit_sesion_series: series REALMENTE registradas en una sesion (tracking real).
--    `sesion_id` referencia la tabla `sesiones` ya existente del modulo Salud.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.gfit_sesion_series (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid references public.sesiones(id) on delete cascade,
  dia_ejercicio_id uuid references public.gfit_dia_ejercicios(id) on delete set null,
  ejercicio_id uuid not null references public.ejercicios_catalogo(id),
  orden smallint,
  tipo text check (tipo in ('warmup','working','drop','failure')) default 'working',
  peso_kg numeric(6,2),
  reps smallint,
  completada_at timestamptz default now()
);
create index if not exists gfit_sesion_series_sesion_idx on public.gfit_sesion_series(sesion_id);
create index if not exists gfit_sesion_series_ejercicio_idx on public.gfit_sesion_series(ejercicio_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Enlace sesiones -> gfit_dias (que dia de la rutina se entreno en esa sesion).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.sesiones add column if not exists rutina_dia_id uuid references public.gfit_dias(id) on delete set null;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: habilitado en todas las tablas nuevas (patron OS: acceso solo via service_role).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.ejercicios_catalogo enable row level security;
alter table public.gfit_rutinas enable row level security;
alter table public.gfit_dias enable row level security;
alter table public.gfit_dia_ejercicios enable row level security;
alter table public.gfit_series_plan enable row level security;
alter table public.gfit_sesion_series enable row level security;

grant all on
  public.ejercicios_catalogo,
  public.gfit_rutinas,
  public.gfit_dias,
  public.gfit_dia_ejercicios,
  public.gfit_series_plan,
  public.gfit_sesion_series
to service_role;

notify pgrst, 'reload schema';
