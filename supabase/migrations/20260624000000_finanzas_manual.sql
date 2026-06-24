-- Finanzas manual OS — cuentas, deudas, gastos, presupuestos
-- Mismo modelo de seguridad que crm_leads y tareas: RLS activado sin policies.
-- El acceso es exclusivamente server-side via SERVICE_ROLE_KEY (bypassa RLS),
-- detras de rutas /api/os/* protegidas con la cookie os_auth.

create table if not exists public.cuentas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  tipo text,
  saldo numeric not null default 0,
  moneda text not null default 'MXN',
  notas text
);

create table if not exists public.deudas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  acreedor text not null,
  monto numeric not null default 0,
  tasa numeric,
  cuota numeric,
  fecha_limite date,
  estado text not null default 'activa',
  notas text
);

create table if not exists public.gastos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fecha date,
  categoria text,
  descripcion text,
  monto numeric not null default 0,
  cuenta text
);

create table if not exists public.presupuestos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  categoria text not null,
  limite_mensual numeric not null default 0
);

alter table public.cuentas      enable row level security;
alter table public.deudas       enable row level security;
alter table public.gastos       enable row level security;
alter table public.presupuestos enable row level security;
