-- OS Manager Layer: mueve el nucleo de productividad del OS de archivos estaticos
-- (apps/web/src/os/data/*.ts) a Supabase.
--
-- MODELO DE METODOLOGIA (la pieza sutil, leer antes de tocar):
-- Maker/Manager y promover/vender/construir/entregar son ejes ORTOGONALES.
--   * El MODO (maker|manager|off) es una forma de atencion y vive en el DIA -> os_semana.
--   * La FUNCION (promover|vender|construir|entregar) es una etapa de la cadena de valor
--     y vive en el BLOQUE -> os_bloques.
--   * La CARA de una funcion (que acciones concretas sugiere) NO se guarda: se DERIVA
--     cruzando la funcion del bloque con el modo del dia. El mismo bloque "vender" sugiere
--     "reunion de ventas / revisar CRM" en un dia manager y "escribir propuesta / deck" en
--     un dia maker. Ese cruce vive en os_funcion_acciones.
--   * El balance de funciones (el 4/4/4 de Hormozi) se cuadra por SEMANA, no por dia:
--     os_funcion_presupuesto (objetivo) vs os_bloque_log (real). Partir cada dia en tres
--     fragmentaria el dia Maker, que es justo lo que Maker/Manager existe para evitar.
--
-- Patron OS (Molde A): RLS habilitado sin politicas, acceso solo via service_role desde
-- endpoints, notify pgrst al final.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Principios e identidad
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_principios (
  orden smallint primary key,
  texto text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Objetivos de 90 dias. El canon exige 3 elementos por objetivo: metrica
--    especifica, punto de partida honesto, y la medida de avance (lo que se
--    controla cada semana, a diferencia de la medida de resultado).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_objetivos (
  id uuid primary key default gen_random_uuid(),
  orden smallint not null,
  titulo text not null,
  descripcion text,
  metrica_resultado text,
  punto_partida text,
  medida_avance text,
  fecha_inicio date,
  fecha_fin date,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Un solo objetivo por posicion entre los activos (el cerebro no sostiene mas de 3).
create unique index if not exists os_objetivos_orden_activo_uniq
  on public.os_objetivos(orden) where activo;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Lineas / proyectos con el Stack del canon:
--    0 Urgente (riesgo activo) | 1 Dinero | 2 Soporte | 3 Estabilizar | 4 Pausado
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_lineas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  prioridad_stack smallint not null default 3 check (prioridad_stack between 0 and 4),
  recibe_maker boolean not null default false,
  objetivo_id uuid references public.os_objetivos(id) on delete set null,
  siguiente_accion text,
  estado text not null default 'activo' check (estado in ('activo','mantenimiento','pausado')),
  orden smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists os_lineas_stack_idx on public.os_lineas(prioridad_stack);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. La semana: el MODO vive aqui, por dia ISO (1=Lunes .. 7=Domingo).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_semana (
  dia smallint primary key check (dia between 1 and 7),
  modo text not null check (modo in ('maker','manager','off')),
  sale boolean not null default false,
  etiqueta text,
  nota text,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Los bloques: la FUNCION vive aqui. La cara se deriva de os_semana.modo.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_bloques (
  id uuid primary key default gen_random_uuid(),
  dia smallint not null references public.os_semana(dia) on delete cascade,
  orden smallint not null,
  funcion text not null check (funcion in ('promover','vender','construir','entregar')),
  hora_inicio time,
  hora_fin time,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists os_bloques_dia_idx on public.os_bloques(dia);
create unique index if not exists os_bloques_dia_orden_uniq
  on public.os_bloques(dia, orden) where activo;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. La matriz funcion x cara: el catalogo que vuelve la metodologia accionable.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_funcion_acciones (
  id uuid primary key default gen_random_uuid(),
  funcion text not null check (funcion in ('promover','vender','construir','entregar')),
  cara text not null check (cara in ('maker','manager')),
  accion text not null,
  orden smallint,
  created_at timestamptz not null default now()
);
create unique index if not exists os_funcion_acciones_uniq
  on public.os_funcion_acciones(funcion, cara, accion);
create index if not exists os_funcion_acciones_lookup_idx
  on public.os_funcion_acciones(funcion, cara);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Presupuesto semanal de funciones (el 4/4/4 como default TUNABLE: lo avanzado
--    es sobre-asignar al cuello de botella, no repartir plano).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_funcion_presupuesto (
  funcion text primary key check (funcion in ('promover','vender','construir','entregar')),
  horas_semana_objetivo numeric(4,1) not null default 4,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Registro real de tiempo por funcion (el lado "real" del presupuesto).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_bloque_log (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  bloque_id uuid references public.os_bloques(id) on delete set null,
  funcion text not null check (funcion in ('promover','vender','construir','entregar')),
  minutos int not null check (minutos > 0),
  nota text,
  created_at timestamptz not null default now()
);
create index if not exists os_bloque_log_fecha_idx on public.os_bloque_log(fecha desc);
create index if not exists os_bloque_log_funcion_idx on public.os_bloque_log(funcion, fecha desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. El dia: One Domino + Discomfort First.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_dia (
  fecha date primary key,
  domino_titulo text,
  domino_linea text,
  domino_razon text,
  domino_hecho boolean not null default false,
  discomfort_titulo text,
  discomfort_hecho boolean not null default false,
  nota text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.os_wins (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  texto text not null,
  categoria text,
  created_at timestamptz not null default now()
);
create index if not exists os_wins_fecha_idx on public.os_wins(fecha desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. La semana operativa: maximo 3 prioridades + la lista explicita de lo que
--     NO se hara (el reverso, igual de importante segun el canon).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_priority_stack (
  id uuid primary key default gen_random_uuid(),
  semana_inicio date not null,
  orden smallint not null check (orden between 1 and 3),
  titulo text not null,
  objetivo_id uuid references public.os_objetivos(id) on delete set null,
  hecho boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists os_priority_stack_uniq
  on public.os_priority_stack(semana_inicio, orden);

create table if not exists public.os_no_hacer (
  id uuid primary key default gen_random_uuid(),
  semana_inicio date not null,
  texto text not null,
  created_at timestamptz not null default now()
);
create index if not exists os_no_hacer_semana_idx on public.os_no_hacer(semana_inicio);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. Sistema de revisiones (semanal viernes / mensual / reset de 90 dias).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_revisiones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('semanal','mensual','reset90')),
  periodo text not null,
  contenido jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists os_revisiones_tipo_periodo_uniq
  on public.os_revisiones(tipo, periodo);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. KPIs. `valor` es NUMERICO aqui (el demo os/data/kpis.ts lo tenia como string
--     preformateado); el formato es responsabilidad de la UI. La serie temporal
--     habilita comparativas 7d/14d/1m/12m, mismo patron que gfit/progreso.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_kpis (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  unidad text,
  meta numeric,
  categoria text,
  orden smallint,
  fuente text not null default 'manual' check (fuente in ('manual','auto')),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.os_kpi_valores (
  id uuid primary key default gen_random_uuid(),
  kpi_id uuid not null references public.os_kpis(id) on delete cascade,
  fecha date not null,
  valor numeric not null,
  created_at timestamptz not null default now()
);
create unique index if not exists os_kpi_valores_uniq on public.os_kpi_valores(kpi_id, fecha);
create index if not exists os_kpi_valores_fecha_idx on public.os_kpi_valores(fecha desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. Captura: bandeja, ideas de contenido, aprobaciones.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.os_bandeja (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  url text,
  descripcion text,
  categoria text,
  leido boolean not null default false,
  fecha_captura timestamptz not null default now()
);
create index if not exists os_bandeja_leido_idx on public.os_bandeja(leido, fecha_captura desc);

create table if not exists public.os_contenido_ideas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  formato text,
  idea_madre text,
  repurposing text[] not null default '{}',
  status text not null default 'idea',
  plataformas text[] not null default '{}',
  fecha_target date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- `ejecutado` existe porque la UI (OSAprobaciones.tsx) tiene un boton "Ejecutar"
-- ademas de aprobar/rechazar. `tipo` lo renderiza como eyebrow.
create table if not exists public.os_aprobaciones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text,
  contexto text,
  opciones jsonb not null default '[]'::jsonb,
  recomendacion text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','aprobado','rechazado','ejecutado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists os_aprobaciones_estado_idx on public.os_aprobaciones(estado);

-- La UI de Agenda ya mandaba `fin` y `ubicacion`; sin estas columnas se perdian
-- en silencio. `reuniones` es preexistente, por eso se ALTERa y no se crea.
alter table public.reuniones add column if not exists fin timestamptz;
alter table public.reuniones add column if not exists ubicacion text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. Biometricas diarias. Fuente: Google Health API (reemplaza al Fitbit Web API,
--     que se apaga el 30 de septiembre de 2026). Escritura desde n8n via X-OS-Token.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.biometricas_dia (
  fecha date primary key,
  pasos int,
  sueno_min int,
  peso_kg numeric(5,2),
  fc_reposo int,
  fuente text not null default 'google_health',
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists biometricas_dia_fecha_idx on public.biometricas_dia(fecha desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. SEED del canon (config estable, idempotente). La data PERSONAL de Pancho
--     (objetivos, lineas, kpis) la siembra apps/web/scripts/seed-os-manager.mjs
--     desde el brain, y el onboarding la confirma y ajusta.
-- ─────────────────────────────────────────────────────────────────────────────

-- Los 6 principios (fuente: brain `metodologia-replicable`).
insert into public.os_principios (orden, texto) values
  (1, 'Accion sobre perfeccion. Publico al 70%.'),
  (2, 'Un domino al dia.'),
  (3, 'Lo incomodo primero.'),
  (4, 'Maker y Manager separados por dias enteros.'),
  (5, 'El sistema es mi jefe, no mi animo.'),
  (6, 'El contenido es ingreso que compone.')
on conflict (orden) do nothing;

-- La semana de Pancho (fuente: brain `mi-os-personal`). ISO 1=Lunes .. 7=Domingo.
insert into public.os_semana (dia, modo, sale, etiqueta, nota) values
  (1, 'manager', false, 'Manager en casa', 'Planificar la semana, alinear socios, fijar priority stack y el One Domino de cada dia'),
  (2, 'manager', true,  'Manager, salir',  'Reuniones externas, comercializar, ventas, tramites de banco e IESS'),
  (3, 'maker',   false, 'Maker',           'Crear y entregar. Bloques largos, sin reuniones'),
  (4, 'manager', true,  'Manager, salir',  'El segundo dia de salir, mismo criterio'),
  (5, 'maker',   false, 'Maker + cierre',  'Crear, entregar y revision semanal'),
  (6, 'maker',   false, 'Maker, contenido','Batch de contenido: grabar y editar'),
  (7, 'off',     false, 'Off',             'Descanso y prep ligera')
on conflict (dia) do nothing;

-- Presupuesto semanal de funciones. Default 4/4/4/4 (el 4/4/4 de Hormozi extendido
-- a las 4 funciones), TUNABLE: hoy el cuello de botella de Pancho es vender/cobrar.
insert into public.os_funcion_presupuesto (funcion, horas_semana_objetivo) values
  ('promover', 8),
  ('vender', 12),
  ('construir', 12),
  ('entregar', 12)
on conflict (funcion) do nothing;

-- La matriz funcion x cara. Es lo que hace que el mismo bloque se vea distinto
-- segun el modo del dia.
insert into public.os_funcion_acciones (funcion, cara, accion, orden) values
  -- PROMOVER
  ('promover','maker','Escribir posts y guiones',1),
  ('promover','maker','Grabar y editar',2),
  ('promover','maker','Batch de contenido y programarlo',3),
  ('promover','maker','Disenar miniaturas y piezas',4),
  ('promover','manager','Responder comentarios y DMs',1),
  ('promover','manager','Podcasts, entrevistas, colaboraciones',2),
  ('promover','manager','Networking y relaciones publicas',3),
  -- VENDER
  ('vender','maker','Escribir propuestas',1),
  ('vender','maker','Armar decks',2),
  ('vender','maker','Secuencias de email y guiones de follow-up',3),
  ('vender','manager','Reuniones y llamadas de venta',1),
  ('vender','manager','Revisar CRM y mover el pipeline',2),
  ('vender','manager','Seguimientos y cobros',3),
  ('vender','manager','Negociar y cerrar',4),
  -- CONSTRUIR
  ('construir','maker','Construir sistemas y automatizaciones',1),
  ('construir','maker','Producto y brains (Claude Code, Codex)',2),
  ('construir','maker','Disenar la arquitectura y escribirla',3),
  ('construir','manager','Decidir arquitectura y alcance',1),
  ('construir','manager','Delegar con el 10-80-10',2),
  ('construir','manager','Contratar y evaluar herramientas',3),
  -- ENTREGAR
  ('entregar','maker','El trabajo profundo comprometido',1),
  ('entregar','maker','Ejecutar el entregable del cliente',2),
  ('entregar','manager','Reunion de proyecto y alineacion',1),
  ('entregar','manager','Revisar y dar feedback',2),
  ('entregar','manager','Desbloquear al equipo',3)
on conflict (funcion, cara, accion) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: habilitado en todas las tablas nuevas (patron OS: acceso solo via
-- service_role desde endpoints).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.os_principios          enable row level security;
alter table public.os_objetivos           enable row level security;
alter table public.os_lineas              enable row level security;
alter table public.os_semana              enable row level security;
alter table public.os_bloques             enable row level security;
alter table public.os_funcion_acciones    enable row level security;
alter table public.os_funcion_presupuesto enable row level security;
alter table public.os_bloque_log          enable row level security;
alter table public.os_dia                 enable row level security;
alter table public.os_wins                enable row level security;
alter table public.os_priority_stack      enable row level security;
alter table public.os_no_hacer            enable row level security;
alter table public.os_revisiones          enable row level security;
alter table public.os_kpis                enable row level security;
alter table public.os_kpi_valores         enable row level security;
alter table public.os_bandeja             enable row level security;
alter table public.os_contenido_ideas     enable row level security;
alter table public.os_aprobaciones        enable row level security;
alter table public.biometricas_dia        enable row level security;

grant all on
  public.os_principios,
  public.os_objetivos,
  public.os_lineas,
  public.os_semana,
  public.os_bloques,
  public.os_funcion_acciones,
  public.os_funcion_presupuesto,
  public.os_bloque_log,
  public.os_dia,
  public.os_wins,
  public.os_priority_stack,
  public.os_no_hacer,
  public.os_revisiones,
  public.os_kpis,
  public.os_kpi_valores,
  public.os_bandeja,
  public.os_contenido_ideas,
  public.os_aprobaciones,
  public.biometricas_dia
to service_role;

notify pgrst, 'reload schema';
