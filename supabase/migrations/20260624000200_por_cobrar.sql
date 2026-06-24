-- Por cobrar OS — dinero por entrar (pipeline de cobros manual).
-- Mismo modelo de seguridad que cuentas/deudas: RLS activado sin policies,
-- acceso server-side via SERVICE_ROLE_KEY detras de /api/os/* (cookie os_auth).
-- estado: uno de aplicando | esperando | aprobado_sin_pagar | cobrado.

create table if not exists public.por_cobrar (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  cliente text not null,
  proyecto text,
  monto numeric not null default 0,
  moneda text not null default 'USD',
  estado text not null default 'aplicando',
  fecha_esperada date,
  notas text
);

alter table public.por_cobrar enable row level security;
