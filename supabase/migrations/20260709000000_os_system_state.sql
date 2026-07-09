-- Estado editable de Mi Sistema.
-- Lo consumen /api/os/system, n8n y Hermes mediante token server-side.

create table if not exists public.os_system_state (
  key text primary key,
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.os_system_state enable row level security;
