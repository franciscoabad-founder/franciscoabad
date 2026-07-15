-- Salud OS: fundación de datos del módulo /os/salud.
-- Submódulos: Nutrición, Ayuno, Entrenamiento, Cuerpo, Estiramiento.
-- Patrón OS: RLS habilitado sin políticas; acceso solo vía service_role desde endpoints.
-- Integraciones futuras (Fitbit, balanza Renpho, Telegram/n8n): columnas `source`/`fuente`
-- preparadas y endpoints que aceptan escritura externa con header X-OS-Token.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. salud_config: targets y preferencias. Una sola fila (singleton por convención).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.salud_config (
  id uuid primary key default gen_random_uuid(),
  -- Targets base (tipo de día "normal")
  kcal_min int not null default 2100,
  kcal_max int not null default 2200,
  proteina_g int not null default 160,
  carbos_g int not null default 160,
  grasa_g_min int not null default 90,
  grasa_g_max int not null default 95,
  -- Ajustes por tipo de día (JSON: { leg_day: {...}, refeed: {...}, keto_light: {...}, keto: {...} })
  ajustes_tipo_dia jsonb not null default '{
    "normal":     {"kcal_min":2100,"kcal_max":2200,"proteina_g":160,"carbos_g":160,"grasa_g_min":90,"grasa_g_max":95},
    "leg_day":    {"kcal_min":2200,"kcal_max":2400,"proteina_g":160,"carbos_g":220,"grasa_g_min":80,"grasa_g_max":90},
    "refeed":     {"kcal_min":2600,"kcal_max":2800,"proteina_g":160,"carbos_g":325,"grasa_g_min":40,"grasa_g_max":50},
    "keto_light": {"kcal_min":2000,"kcal_max":2200,"proteina_g":170,"carbos_g":40,"grasa_g_min":140,"grasa_g_max":160},
    "keto":       {"kcal_min":2000,"kcal_max":2200,"proteina_g":170,"carbos_g":25,"grasa_g_min":150,"grasa_g_max":170}
  }'::jsonb,
  -- Preferencias generales
  protocolo_ayuno_default text not null default '16_8',
  unidad_peso text not null default 'kg' check (unidad_peso in ('kg','lb')),
  preferencias jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fila única de config con los targets de Pancho (idempotente).
insert into public.salud_config (id)
select gen_random_uuid()
where not exists (select 1 from public.salud_config);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. alimentos: base de datos de alimentos (personal / Open Food Facts / USDA / LATAM).
--    Macros por 100 g. `porciones` describe medidas comunes.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.alimentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  marca text,
  barcode text,
  fuente text not null default 'personal' check (fuente in ('personal','off','usda','latam')),
  -- Macros por 100 g
  kcal numeric not null default 0,
  proteina_g numeric not null default 0,
  carbos_g numeric not null default 0,
  grasa_g numeric not null default 0,
  fibra_g numeric,
  -- porciones: [{ "medida": "1 taza", "gramos": 158 }, ...]
  porciones jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists alimentos_nombre_idx on public.alimentos using gin (to_tsvector('spanish', nombre));
create unique index if not exists alimentos_barcode_uniq on public.alimentos(barcode) where barcode is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. comidas_log: registro de comidas con macros calculados y denormalizados.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.comidas_log (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  momento text not null default 'snack' check (momento in ('desayuno','almuerzo','cena','snack')),
  alimento_id uuid references public.alimentos(id) on delete set null,
  descripcion_libre text,
  cantidad_g numeric,
  -- Macros calculados/denormalizados de la entrada completa
  kcal numeric,
  proteina_g numeric,
  carbos_g numeric,
  grasa_g numeric,
  fibra_g numeric,
  foto_url text,
  source text not null default 'manual' check (source in ('manual','telegram','agente')),
  tipo_dia text not null default 'normal' check (tipo_dia in ('normal','leg_day','refeed','keto_light','keto')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comidas_log_fecha_idx on public.comidas_log(fecha desc);
create index if not exists comidas_log_alimento_idx on public.comidas_log(alimento_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ayunos: registro de ayunos con protocolo y objetivo.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.ayunos (
  id uuid primary key default gen_random_uuid(),
  inicio timestamptz not null default now(),
  fin timestamptz,
  protocolo text not null default '16_8' check (protocolo in ('16_8','18_6','20_4','omad','extendido','custom')),
  objetivo_horas numeric not null default 16,
  notas text,
  source text not null default 'manual' check (source in ('manual','telegram','agente')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ayunos_inicio_idx on public.ayunos(inicio desc);
create index if not exists ayunos_abiertos_idx on public.ayunos(inicio) where fin is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ejercicios: biblioteca de ejercicios (wger / personal).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.ejercicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  nombre_en text,
  grupo_muscular_primario text,
  secundarios jsonb not null default '[]'::jsonb,
  patron text check (patron in ('push_h','push_v','pull_h','pull_v','squat','hinge','core','otro')),
  equipamiento text,
  instrucciones text,
  media_url text,
  fuente text not null default 'personal' check (fuente in ('wger','personal')),
  wger_id int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ejercicios_nombre_idx on public.ejercicios using gin (to_tsvector('spanish', nombre));
create index if not exists ejercicios_grupo_idx on public.ejercicios(grupo_muscular_primario);
create index if not exists ejercicios_patron_idx on public.ejercicios(patron);
create unique index if not exists ejercicios_wger_uniq on public.ejercicios(wger_id) where wger_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. rutinas + rutina_ejercicios.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.rutinas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  -- dias: ["lunes","miercoles","viernes"] o estructura libre
  dias jsonb not null default '[]'::jsonb,
  archivada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rutina_ejercicios (
  id uuid primary key default gen_random_uuid(),
  rutina_id uuid not null references public.rutinas(id) on delete cascade,
  ejercicio_id uuid not null references public.ejercicios(id) on delete cascade,
  orden int not null default 0,
  -- sets_plan: [{tipo, reps_min, reps_max, peso_objetivo, descanso_seg, superset_con}]
  sets_plan jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists rutina_ejercicios_rutina_idx on public.rutina_ejercicios(rutina_id);
create index if not exists rutina_ejercicios_ejercicio_idx on public.rutina_ejercicios(ejercicio_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. sesiones + sets_log.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.sesiones (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  rutina_id uuid references public.rutinas(id) on delete set null,
  tipo text not null default 'gym' check (tipo in ('gym','caminata','cardio','movilidad','estiramiento')),
  duracion_min numeric,
  notas text,
  rpe_sesion numeric,
  source text not null default 'manual' check (source in ('manual','telegram','agente')),
  inicio timestamptz,
  fin timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sesiones_fecha_idx on public.sesiones(fecha desc);
create index if not exists sesiones_rutina_idx on public.sesiones(rutina_id);

create table if not exists public.sets_log (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid not null references public.sesiones(id) on delete cascade,
  ejercicio_id uuid not null references public.ejercicios(id) on delete cascade,
  orden int not null default 0,
  tipo_set text not null default 'working' check (tipo_set in ('warmup','working','dropset','superset','amrap','failure')),
  reps numeric,
  peso_kg numeric,
  rpe numeric,
  completado boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists sets_log_sesion_idx on public.sets_log(sesion_id);
create index if not exists sets_log_ejercicio_idx on public.sets_log(ejercicio_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. cuerpo_log: mediciones corporales (manual / Renpho / Fitbit).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.cuerpo_log (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  peso_kg numeric,
  grasa_pct numeric,
  musculo_kg numeric,
  agua_pct numeric,
  cintura_cm numeric,
  sueno_horas numeric,
  source text not null default 'manual' check (source in ('manual','renpho','fitbit')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cuerpo_log_fecha_idx on public.cuerpo_log(fecha desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. rutinas_estiramiento: rutinas guiadas paso a paso.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.rutinas_estiramiento (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  -- pasos: [{nombre, detalle, duracion_seg, por_lado}]
  pasos jsonb not null default '[]'::jsonb,
  archivada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: habilitado en todas las tablas (patrón OS: acceso solo vía service_role).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.salud_config enable row level security;
alter table public.alimentos enable row level security;
alter table public.comidas_log enable row level security;
alter table public.ayunos enable row level security;
alter table public.ejercicios enable row level security;
alter table public.rutinas enable row level security;
alter table public.rutina_ejercicios enable row level security;
alter table public.sesiones enable row level security;
alter table public.sets_log enable row level security;
alter table public.cuerpo_log enable row level security;
alter table public.rutinas_estiramiento enable row level security;

grant all on
  public.salud_config,
  public.alimentos,
  public.comidas_log,
  public.ayunos,
  public.ejercicios,
  public.rutinas,
  public.rutina_ejercicios,
  public.sesiones,
  public.sets_log,
  public.cuerpo_log,
  public.rutinas_estiramiento
to service_role;

notify pgrst, 'reload schema';
</content>
