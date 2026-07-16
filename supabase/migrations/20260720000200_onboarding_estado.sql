-- Onboarding generico del OS: progreso por modulo (framework estilo Yazio).
-- Una fila por modulo ('os', 'salud', etc.), con el paso actual y las respuestas
-- acumuladas en jsonb. `completado_at` marca el fin del flujo para ese modulo.
-- Patron OS (Molde A): RLS habilitado sin politicas, acceso solo via service_role
-- desde endpoints, notify pgrst al final.

create table if not exists public.onboarding_estado (
  id uuid primary key default gen_random_uuid(),
  modulo text not null unique,
  paso int not null default 0,
  respuestas jsonb not null default '{}'::jsonb,
  completado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_estado_modulo_idx on public.onboarding_estado(modulo);

alter table public.onboarding_estado enable row level security;

grant all on public.onboarding_estado to service_role;

notify pgrst, 'reload schema';
