-- Capa GTD del OS: pendientes, notas, recordatorios, subtareas y reuniones.
-- Pendiente: intención sin fecha. Nota: pensamiento capturado, convertible.
-- Recordatorio: aviso con fecha que Hermes empuja al celular (no operativo).
-- Tarea: operativa, estilo war room Monday (grupo, prioridad, tipo, subtareas).
-- Reunión: registro con resumen de Flow (se llena después).

-- 1. Tareas: campos war room + jerarquía de subtareas
alter table tareas add column if not exists prioridad text check (prioridad in ('low','medium','high','critical')) default 'medium';
alter table tareas add column if not exists tipo text;
alter table tareas add column if not exists grupo text default 'general';
alter table tareas add column if not exists parent_id uuid references tareas(id) on delete cascade;
alter table tareas add column if not exists orden integer default 0;
create index if not exists tareas_parent_idx on tareas(parent_id);

-- Regla de negocio (se valida en el endpoint, no con trigger):
-- subtarea.deadline <= tarea_padre.deadline

-- 2. Pendientes: cosas que quiero hacer, sin fecha ni deadline
create table if not exists public.pendientes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  detalle text,
  proyecto text,
  estado text not null default 'abierto' check (estado in ('abierto','convertido','descartado','hecho')),
  convertido_a text,           -- 'tarea' | 'recordatorio'
  convertido_id uuid,
  origen_nota_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Notas: capturas de pensamiento, convertibles a pendiente/tarea/recordatorio
create table if not exists public.notas (
  id uuid primary key default gen_random_uuid(),
  contenido text not null,
  tags text[] default '{}',
  estado text not null default 'activa' check (estado in ('activa','convertida','archivada')),
  convertida_a text,           -- 'pendiente' | 'tarea' | 'recordatorio'
  convertida_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Recordatorios: avisos con fecha que Hermes manda al celular
create table if not exists public.recordatorios (
  id uuid primary key default gen_random_uuid(),
  mensaje text not null,
  recordar_at timestamptz not null,
  canal text not null default 'telegram',
  tarea_id uuid references tareas(id) on delete set null,
  estado text not null default 'pendiente' check (estado in ('pendiente','enviado','hecho','cancelado')),
  enviado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recordatorios_pendientes_idx on recordatorios(recordar_at) where estado = 'pendiente';

-- 5. Reuniones: registro con resumen de Flow (integración posterior)
create table if not exists public.reuniones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  fecha timestamptz not null,
  resumen text,
  brain_slug text,             -- ej. reunion-flow-36
  fuente text default 'flow',
  created_at timestamptz not null default now()
);

-- 6. Onboarding del OS: flag en os_system_state
alter table os_system_state add column if not exists onboarding_completed boolean not null default false;
alter table os_system_state add column if not exists onboarding_answers jsonb default '{}';

-- RLS igual que el resto del OS (acceso solo via service_role desde endpoints)
alter table public.pendientes enable row level security;
alter table public.notas enable row level security;
alter table public.recordatorios enable row level security;
alter table public.reuniones enable row level security;

grant all on public.recordatorios, public.pendientes, public.notas, public.reuniones to service_role;
