-- GFIT: logros (achievements). Catálogo + logros obtenidos, ligados al ledger
-- transversal de gamificación (xp_events, tipo 'logro'). Fuente: research-gfit.md,
-- sección "Achievements" (12 logros, con la ciencia detrás de cada uno).
-- Patrón OS (Molde A): RLS habilitado sin políticas, acceso solo vía service_role
-- desde endpoints, notify pgrst al final.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. gfit_logros: catálogo de logros (config declarativa, sin código por logro).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.gfit_logros (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  descripcion text not null,
  -- ciencia: rationale de una línea (la teoría/estudio detrás del logro).
  ciencia text not null,
  premio_xp int not null default 25,
  premio_oro int not null default 10,
  -- umbral: config del disparador. Siempre trae `tipo` (evaluado por
  -- lib/gfit/logros.ts::evaluarLogros) + params propios de ese tipo. Tipos:
  -- 'racha_dias' | 'pr' | 'tonelaje_total' | 'adherencia_pct' | 'doble_progresion' |
  -- 'grupos_mev_semana' | 'sorpresa_sesiones' | 'primera_sesion' |
  -- 'sesion_tras_lapso' | 'supera_promedio' | 'meses_activos'.
  umbral jsonb not null default '{}'::jsonb,
  orden smallint,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists gfit_logros_activo_idx on public.gfit_logros(activo);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. gfit_logros_obtenidos: instancias de logro otorgadas. `nivel` soporta logros
--    escalonados (ej. tonelaje 1k/10k/100k, racha 7/30/90) y logros repetibles
--    (pr, doble_progresion, sesion_tras_lapso, supera_promedio: nivel incrementa en
--    cada nueva ocurrencia porque el unique(logro_id, nivel) exige un valor distinto
--    para volver a otorgar).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.gfit_logros_obtenidos (
  id uuid primary key default gen_random_uuid(),
  logro_id uuid not null references public.gfit_logros(id) on delete cascade,
  nivel smallint not null default 1,
  obtenido_at timestamptz not null default now(),
  unique (logro_id, nivel)
);
create index if not exists gfit_logros_obtenidos_logro_idx on public.gfit_logros_obtenidos(logro_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. xp_events: agrega 'logro' al CHECK de `tipo` (20260718000000_juego_schema.sql
--    lo declaró inline en el create table sin nombre explícito; Postgres le asigna
--    el nombre por defecto `<tabla>_<columna>_check` = `xp_events_tipo_check`).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.xp_events drop constraint if exists xp_events_tipo_check;
alter table public.xp_events add constraint xp_events_tipo_check check (tipo in (
  'habito_check','diaria_check','diaria_fallo','tarea_hecha',
  'pendiente_hecho','comida_log','sesion_gym','ayuno_fin','registro_cuerpo',
  'dia_perfecto','quest_ganada','quest_perdida','compra_recompensa','loot',
  'muerte','ajuste','logro'
));

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Seed: los 12 logros de research-gfit.md (idempotente por slug).
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.gfit_logros (slug, nombre, descripcion, ciencia, premio_xp, premio_oro, umbral, orden) values
  (
    'racha-de-hierro',
    'Racha de Hierro',
    'Entrena días consecutivos sin cortar la cadena: 7, 30 o 90 días seguidos.',
    'Streaks y aversión a romper la cadena (Seinfeld "don''t break the chain").',
    25, 10,
    '{"tipo":"racha_dias","dias":[7,30,90]}'::jsonb,
    1
  ),
  (
    'record-personal',
    'Récord Personal',
    'Supera tu 1RM estimado histórico en cualquier ejercicio.',
    'Logro objetivo self-referential: te compite contra tu propio historial, no contra otros.',
    30, 15,
    '{"tipo":"pr"}'::jsonb,
    2
  ),
  (
    'primer-paso',
    'Primer Paso',
    'Registra tu primera sesión de entrenamiento.',
    'Fresh start effect (Dai, Milkman & Riis, 2014): los comienzos motivan más que la continuidad.',
    15, 5,
    '{"tipo":"primera_sesion"}'::jsonb,
    3
  ),
  (
    'reinicio-con-fuerza',
    'Reinicio con Fuerza',
    'Entrena un lunes o el día 1 del mes.',
    'Fresh start effect: los "temporal landmarks" (lunes, inicio de mes) impulsan la acción hacia metas.',
    15, 5,
    '{"tipo":"sesion_tras_lapso","modo":"landmark"}'::jsonb,
    4
  ),
  (
    'volumen-mil',
    'Volumen Mil',
    'Acumula 1,000 / 10,000 / 100,000 kg de tonelaje total levantado.',
    'Competencia visible y progreso cuantificado (teoría de autodeterminación, competencia percibida).',
    25, 10,
    '{"tipo":"tonelaje_total","tiers":[1000,10000,100000]}'::jsonb,
    5
  ),
  (
    'constancia-de-oro',
    'Constancia de Oro',
    'Alcanza al menos 80% de adherencia a tus sesiones en las últimas 4 semanas.',
    'Premia el proceso (consistencia), no el resultado: mejor predictor de progreso a largo plazo.',
    30, 15,
    '{"tipo":"adherencia_pct","pct":80,"semanas":4}'::jsonb,
    6
  ),
  (
    'doble-progresion',
    'Doble Progresión',
    'Completa un ciclo de subir reps hasta el tope y luego subir carga en un ejercicio.',
    'Enseña el patrón de progresión de carga correcto (doble progresión, Schoenfeld/Helms).',
    20, 10,
    '{"tipo":"doble_progresion"}'::jsonb,
    7
  ),
  (
    'explorador-muscular',
    'Explorador Muscular',
    'Alcanza el volumen mínimo efectivo (MEV) en al menos 5 grupos musculares distintos en una semana.',
    'Nudge hacia el balance de volumen entre grupos (Israetel/RP, MEV por grupo).',
    20, 10,
    '{"tipo":"grupos_mev_semana","grupos":5}'::jsonb,
    8
  ),
  (
    'caja-sorpresa',
    'Caja Sorpresa',
    'Sigue entrenando: hay una sorpresa esperándote más adelante.',
    'Variable reward / refuerzo de razón variable (Skinner): el umbral no se revela a propósito.',
    20, 10,
    '{"tipo":"sorpresa_sesiones","umbral_actual":12}'::jsonb,
    9
  ),
  (
    'antirrendicion',
    'Antirrendición',
    'Vuelve a entrenar después de haber roto una racha.',
    'Contrarresta el "abstinence violation effect": romper una racha no debe significar rendirse.',
    25, 15,
    '{"tipo":"sesion_tras_lapso","modo":"tras_racha_rota","diasGap":3}'::jsonb,
    10
  ),
  (
    'mentor-de-si-mismo',
    'Mentor de Sí Mismo',
    'Supera el tonelaje promedio de tus últimas 4 semanas en una sola sesión.',
    'Comparación consigo mismo en vez de con otros: motivación intrínseca más sostenible.',
    20, 10,
    '{"tipo":"supera_promedio","semanas":4}'::jsonb,
    11
  ),
  (
    'ano-completo',
    'Año Completo',
    'Registra actividad en 12 meses distintos.',
    'Refuerzo de identidad ("soy alguien que entrena"): la identidad sostiene el hábito más que la meta.',
    50, 25,
    '{"tipo":"meses_activos","meses":12}'::jsonb,
    12
  )
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: habilitado (patrón OS: acceso solo vía service_role desde endpoints).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.gfit_logros enable row level security;
alter table public.gfit_logros_obtenidos enable row level security;

grant all on
  public.gfit_logros,
  public.gfit_logros_obtenidos
to service_role;

notify pgrst, 'reload schema';
