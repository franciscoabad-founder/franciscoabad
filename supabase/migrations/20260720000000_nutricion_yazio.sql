-- Nutricion OS: paridad Yazio sobre el modulo Salud existente.
-- Idempotente: solo agrega lo que falta sobre 20260715000000_salud_os_schema.sql.
-- Patron OS (Molde A): RLS habilitado sin politicas, acceso solo via service_role
-- desde endpoints, notify pgrst al final.
--
-- Nota de compatibilidad (hallazgo real vs. contrato original): `salud_config` YA
-- trae `unidad_peso` desde la migracion base; aqui SOLO se agregan los targets
-- (kcal_objetivo, proteina_objetivo_g, carbos_objetivo_g, grasa_objetivo_g), que
-- no existian. `alimentos` y `comidas_log` YA traen las macros base (kcal,
-- proteina_g, carbos_g, grasa_g, fibra_g); aqui solo se agregan las micro columnas
-- que faltan (azucares, grasas saturada/mono/poliinsaturada, sodio, colesterol) y,
-- en `alimentos`, los contadores de uso (favorito, veces_usado, ultima_vez). La
-- columna jsonb `alimentos.porciones` (legacy, libre) NO se toca ni se duplica: la
-- nueva tabla relacional `alimento_porciones` es un modelo aparte, mas estructurado,
-- pensado para el picker de porciones estilo Yazio.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. salud_config: targets de macros (nullable, se configuran via onboarding).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.salud_config add column if not exists kcal_objetivo int;
alter table public.salud_config add column if not exists proteina_objetivo_g int;
alter table public.salud_config add column if not exists carbos_objetivo_g int;
alter table public.salud_config add column if not exists grasa_objetivo_g int;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. alimentos: micro-nutrientes por 100 g + contadores de uso.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.alimentos add column if not exists azucares_g numeric(6,2);
alter table public.alimentos add column if not exists saturada_g numeric(6,2);
alter table public.alimentos add column if not exists monoinsaturada_g numeric(6,2);
alter table public.alimentos add column if not exists poliinsaturada_g numeric(6,2);
alter table public.alimentos add column if not exists sodio_mg numeric(7,1);
alter table public.alimentos add column if not exists colesterol_mg numeric(7,1);
alter table public.alimentos add column if not exists favorito boolean not null default false;
alter table public.alimentos add column if not exists veces_usado int not null default 0;
alter table public.alimentos add column if not exists ultima_vez timestamptz;

create index if not exists alimentos_favorito_idx on public.alimentos(favorito) where favorito;
create index if not exists alimentos_veces_usado_idx on public.alimentos(veces_usado desc) where veces_usado > 0;
create index if not exists alimentos_ultima_vez_idx on public.alimentos(ultima_vez desc) where ultima_vez is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. comidas_log: mismas micro columnas, como snapshot al momento del registro.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.comidas_log add column if not exists azucares_g numeric(6,2);
alter table public.comidas_log add column if not exists saturada_g numeric(6,2);
alter table public.comidas_log add column if not exists monoinsaturada_g numeric(6,2);
alter table public.comidas_log add column if not exists poliinsaturada_g numeric(6,2);
alter table public.comidas_log add column if not exists sodio_mg numeric(7,1);
alter table public.comidas_log add column if not exists colesterol_mg numeric(7,1);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. alimento_porciones: medidas comunes por alimento (picker estilo Yazio).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.alimento_porciones (
  id uuid primary key default gen_random_uuid(),
  alimento_id uuid not null references public.alimentos(id) on delete cascade,
  nombre text not null,          -- ej. 'taza', 'porcion', 'unidad'
  gramos numeric(7,2) not null,
  orden smallint,
  created_at timestamptz not null default now()
);
create index if not exists alimento_porciones_alimento_idx on public.alimento_porciones(alimento_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. recetas: recetas propias o importadas (somosnlp, themealdb, JSON-LD).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.recetas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  porciones smallint default 1,
  tiempo_min smallint,
  instrucciones text[] not null default '{}',
  foto_url text,
  fuente text,              -- ej. 'somosnlp', 'themealdb', 'import', 'propia'
  fuente_url text,
  -- Macros por porcion (nullable: puede no conocerse en recetas importadas).
  kcal numeric,
  proteina_g numeric,
  carbos_g numeric,
  grasa_g numeric,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recetas_nombre_idx on public.recetas using gin (to_tsvector('spanish', nombre));
create index if not exists recetas_fuente_idx on public.recetas(fuente);
create index if not exists recetas_tags_idx on public.recetas using gin (tags);
-- Idempotencia del seed (upsert por fuente+nombre, ver scripts/seed-recetas-*.mjs).
create unique index if not exists recetas_fuente_nombre_uniq on public.recetas(fuente, nombre);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. receta_ingredientes: lineas de ingredientes de una receta.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.receta_ingredientes (
  id uuid primary key default gen_random_uuid(),
  receta_id uuid not null references public.recetas(id) on delete cascade,
  orden smallint,
  descripcion text not null,        -- linea original (ej. "2 tazas de arroz cocido")
  alimento_id uuid references public.alimentos(id) on delete set null,
  cantidad_g numeric(7,2),
  created_at timestamptz not null default now()
);
create index if not exists receta_ingredientes_receta_idx on public.receta_ingredientes(receta_id);
create index if not exists receta_ingredientes_alimento_idx on public.receta_ingredientes(alimento_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. nutricion_meals: grupos de alimentos reusables ("New Meal" de Yazio).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.nutricion_meals (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  -- items: [{ alimento_id?, descripcion, cantidad_g, kcal, proteina_g, carbos_g, grasa_g }]
  items jsonb not null default '[]'::jsonb,
  kcal numeric,
  proteina_g numeric,
  carbos_g numeric,
  grasa_g numeric,
  veces_usado int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. RPC atomica de uso: evita el lost update de leer alimento -> +1 en JS -> update
--    absoluto (dos registros concurrentes pisandose). Ver 20260718000200_juego_rpc_incrementar.sql
--    para el mismo patron aplicado al motor de gamificacion.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.alimento_incrementar_uso(p_id uuid)
returns setof alimentos
language sql
as $$
  update alimentos
  set veces_usado = veces_usado + 1,
      ultima_vez = now()
  where id = p_id
  returning *;
$$;

grant execute on function public.alimento_incrementar_uso(uuid) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: habilitado en todas las tablas nuevas (patron OS: acceso solo via service_role).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.alimento_porciones enable row level security;
alter table public.recetas enable row level security;
alter table public.receta_ingredientes enable row level security;
alter table public.nutricion_meals enable row level security;

grant all on
  public.alimento_porciones,
  public.recetas,
  public.receta_ingredientes,
  public.nutricion_meals
to service_role;

notify pgrst, 'reload schema';
