-- Modulo Habit Tracker + Journeys del OS personal (Version A del plan de gamificacion).
-- Mecanicas Habitica reimplementadas (habitos +/-, diarias, task value con rendimientos
-- decrecientes) mas journeys estilo Fabulous que desbloquean habitos por etapas.
-- habito_checks es el ledger append-only y fuente de verdad; habitos.valor y
-- habitos_perfil.xp_total son cache derivado (se recalculan desde el ledger si hace falta).
-- Patron OS: RLS habilitado sin politicas, acceso solo via service_role desde los endpoints.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. journeys: catalogo de cursos tematicos, agrupados en 3 montanas de progresion.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  descripcion text,
  montana text not null check (montana in ('foundations','struggle','mastery')),
  orden int not null default 0,
  estado text not null default 'bloqueado' check (estado in ('bloqueado','disponible','en_curso','completado')),
  etapa_actual int not null default 0,
  iniciado_at timestamptz,
  completado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists journeys_montana_idx on public.journeys(montana, orden);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. journey_etapas: cartas de contenido dentro de un journey. Cada etapa trae los
--    habitos que desbloquea al entrar y el criterio medible para avanzar a la siguiente.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.journey_etapas (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  orden int not null default 0,
  nombre text not null,
  -- contenido_slug apunta a la carta MDX en apps/web/src/content/journeys/<journey>/<etapa>.mdx
  contenido_slug text not null,
  -- habitos_desbloquea: [{nombre, tipo, dificultad, dias_semana, intencion, es_core}, ...]
  habitos_desbloquea jsonb not null default '[]'::jsonb,
  -- criterio: {tipo:'checks', habito_nombre, meta, ventana_dias}
  criterio jsonb not null default '{}'::jsonb,
  completada_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists journey_etapas_journey_orden_uniq on public.journey_etapas(journey_id, orden);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. habitos: habitos (+/-) y diarias del jugador. `valor` es el task value estilo
--    Habitica (rendimientos decrecientes via factorValor en lib/habitos/scoring.ts).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.habitos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  tipo text not null check (tipo in ('habito','diaria')),
  permite_mas boolean not null default true,
  permite_menos boolean not null default false,
  dificultad text not null default 'facil' check (dificultad in ('trivial','facil','media','dificil')),
  -- dias_semana: ISO 1=lunes .. 7=domingo (solo aplica a diarias)
  dias_semana smallint[] not null default '{1,2,3,4,5,6,7}'::smallint[],
  -- intencion: implementation intention (cuando/donde), ej "despues del cafe"
  intencion text,
  hora_recordatorio time,
  valor numeric not null default 0,
  -- es_core: solo las diarias core haran dano a HP en la Version B (motor transversal)
  es_core boolean not null default false,
  -- journey_id: de que journey vino este habito (null si se creo suelto)
  journey_id uuid references public.journeys(id) on delete set null,
  en_checklist boolean not null default true,
  orden int not null default 0,
  estado text not null default 'activo' check (estado in ('activo','pausado','archivado')),
  source text not null default 'manual' check (source in ('manual','telegram','agente')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists habitos_estado_idx on public.habitos(estado);
create index if not exists habitos_journey_idx on public.habitos(journey_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. habito_checks: ledger append-only, fuente de verdad de todo el historial. Un
--    habito +/- admite varios checks por dia; la unicidad de diarias (un check por
--    dia) se valida en el endpoint, no con constraint, para permitir deshacer/rehacer.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.habito_checks (
  id uuid primary key default gen_random_uuid(),
  habito_id uuid not null references public.habitos(id) on delete cascade,
  fecha date not null default current_date,
  signo text not null default 'mas' check (signo in ('mas','menos')),
  valor_despues numeric,
  xp int not null default 0,
  oro int not null default 0,
  source text not null default 'manual' check (source in ('manual','telegram','agente')),
  created_at timestamptz not null default now()
);
create index if not exists habito_checks_habito_fecha_idx on public.habito_checks(habito_id, fecha desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. habito_cierres: idempotencia del cierre diario (00:05 via n8n, con fallback lazy
--    en GET habitos). Una fila por fecha ya procesada evita duplicar penalizaciones.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.habito_cierres (
  fecha date primary key,
  procesado_at timestamptz not null default now(),
  -- resumen: {diarias_falladas: [...], dia_perfecto: bool, journeys_avanzados: [...]}
  resumen jsonb not null default '{}'::jsonb
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. habitos_perfil: fila unica con cache de xp_total. En la Version B (motor
--    transversal) se depreca a favor de la tabla `jugador`.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.habitos_perfil (
  id uuid primary key default gen_random_uuid(),
  xp_total int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fila unica de perfil (idempotente, mismo patron que salud_config).
insert into public.habitos_perfil (id)
select gen_random_uuid()
where not exists (select 1 from public.habitos_perfil);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. recordatorios: un habito con hora_recordatorio puede generar su propio aviso.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.recordatorios add column if not exists habito_id uuid references public.habitos(id) on delete cascade;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: habilitado en todas las tablas nuevas (patron OS: acceso solo via service_role).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.journeys enable row level security;
alter table public.journey_etapas enable row level security;
alter table public.habitos enable row level security;
alter table public.habito_checks enable row level security;
alter table public.habito_cierres enable row level security;
alter table public.habitos_perfil enable row level security;

grant all on
  public.journeys,
  public.journey_etapas,
  public.habitos,
  public.habito_checks,
  public.habito_cierres,
  public.habitos_perfil
to service_role;

notify pgrst, 'reload schema';
