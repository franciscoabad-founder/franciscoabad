-- Bitacora de comidas OS — registro cualitativo (que y cuando como).
-- Mismo modelo de seguridad que crm_leads/tareas: RLS activado sin policies,
-- acceso server-side via SERVICE_ROLE_KEY detras de /api/os/* (cookie os_auth).
-- Sin calorias ni datos nutricionales: es una bitacora de patrones.

create table if not exists public.comidas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fecha timestamptz not null default now(),
  momento text,
  descripcion text,
  foto_url text,
  notas text
);

alter table public.comidas enable row level security;
