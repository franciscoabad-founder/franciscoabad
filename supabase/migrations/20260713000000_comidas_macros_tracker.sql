-- Calorie tracker estilo Yazio para Comidas: macros por entrada, metas vigentes y favoritos reutilizables.
-- Comida: entrada existente (fecha, momento, descripcion) + macros y origen de captura (manual/descripcion/voz/foto).
-- Meta: objetivo diario de kcal/macros vigente desde una fecha (permite ajustar metas sin perder historial).
-- Favorito: plato guardado para quick-add repetido (nombre + macros por porcion default).

-- 1. Comidas: columnas de macros y origen de captura
alter table public.comidas add column if not exists kcal numeric;
alter table public.comidas add column if not exists proteina_g numeric;
alter table public.comidas add column if not exists carbos_g numeric;
alter table public.comidas add column if not exists grasa_g numeric;
alter table public.comidas add column if not exists items jsonb default '[]';
alter table public.comidas add column if not exists fuente text default 'manual' check (fuente in ('manual','descripcion','voz','foto'));
alter table public.comidas add column if not exists confianza numeric;

-- 2. Metas: objetivo diario de kcal y macros, vigente desde una fecha
create table if not exists public.comidas_metas (
  id uuid primary key default gen_random_uuid(),
  kcal_objetivo int,
  proteina_g_objetivo int,
  carbos_g_objetivo int,
  grasa_g_objetivo int,
  vigente_desde date not null default current_date,
  created_at timestamptz not null default now()
);

-- 3. Favoritos: platos guardados para reutilizar en quick-add
create table if not exists public.comidas_favoritos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  gramos_default numeric,
  kcal numeric,
  proteina_g numeric,
  carbos_g numeric,
  grasa_g numeric,
  veces_usado int not null default 0,
  ultimo_uso timestamptz,
  created_at timestamptz not null default now()
);

-- RLS igual que el resto del OS (acceso solo via service_role desde endpoints)
alter table public.comidas_metas enable row level security;
alter table public.comidas_favoritos enable row level security;

grant all on public.comidas_metas, public.comidas_favoritos to service_role;

notify pgrst, 'reload schema';
