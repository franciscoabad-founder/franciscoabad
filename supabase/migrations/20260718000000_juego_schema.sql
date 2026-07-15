-- Motor transversal de gamificacion del OS (Version B del plan de gamificacion).
-- xp_events es el ledger append-only y fuente de verdad de todo evento gamificable
-- del OS (habitos, tareas, salud, tienda, quests, loot, muerte, ajustes). `jugador`
-- es el estado agregado (cache derivado, recalculable desde el ledger si hace falta).
-- Patron OS: RLS habilitado sin politicas, acceso solo via service_role desde endpoints.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. xp_events: ledger append-only de todo evento gamificable.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in (
    'habito_check','diaria_check','diaria_fallo','tarea_hecha',
    'pendiente_hecho','comida_log','sesion_gym','ayuno_fin','registro_cuerpo',
    'dia_perfecto','quest_ganada','quest_perdida','compra_recompensa','loot',
    'muerte','ajuste'
  )),
  ref_tabla text,
  ref_id uuid,
  xp int not null default 0,
  oro int not null default 0,
  hp int not null default 0,
  fecha date not null default current_date,
  -- meta: detalle libre por tipo (ej. {prioridad, dificultad, valor, racha})
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
-- Idempotencia: un mismo (tipo, ref_id) no puede otorgar XP dos veces. ref_id nulo
-- (ajustes, loot, muerte, quests) queda fuera de la unicidad: no tienen fila de origen.
create unique index if not exists xp_events_tipo_ref_uniq
  on public.xp_events(tipo, ref_id) where ref_id is not null;
create index if not exists xp_events_fecha_idx on public.xp_events(fecha desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. jugador: fila unica con el estado agregado (xp, oro, hp) y los toggles SDT.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.jugador (
  id uuid primary key default gen_random_uuid(),
  xp_total int not null default 0,
  oro int not null default 0,
  hp int not null default 50,
  hp_max int not null default 50,
  -- config: {hp_activo, oro_activo, loot_activo} - apagar mecanicas si sobre-gamificar mata
  -- la motivacion intrinseca (riesgo SDT documentado en el plan)
  config jsonb not null default '{"hp_activo": true, "oro_activo": true, "loot_activo": true}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Fila unica de jugador (idempotente, mismo patron que habitos_perfil / salud_config).
insert into public.jugador (id)
select gen_random_uuid()
where not exists (select 1 from public.jugador);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. recompensas: tienda de canjes con oro (commitment devices / recompensas custom).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.recompensas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  costo_oro int not null default 0,
  icono text,
  veces_canjeada int not null default 0,
  estado text not null default 'activa' check (estado in ('activa','pausada','archivada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recompensas_estado_idx on public.recompensas(estado);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. quests: commitment devices semanales (apuesta de oro, gana o pierde).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  -- objetivo: {tipo:'conteo_eventos', evento, meta} | {tipo:'habito', habito_id, meta}
  objetivo jsonb not null default '{}'::jsonb,
  apuesta_oro int not null default 0,
  premio_xp int not null default 0,
  premio_oro int not null default 0,
  semana_inicio date not null,
  estado text not null default 'activa' check (estado in ('activa','ganada','perdida','cancelada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists quests_semana_idx on public.quests(semana_inicio);
create index if not exists quests_estado_idx on public.quests(estado);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Migracion A→B: siembra el ledger con el xp_total acumulado en habitos_perfil,
--    para que jugador.xp_total arranque en el mismo punto donde iba el modulo A.
--    Solo corre si xp_events esta vacio (evita duplicar en reruns o si B ya opero).
--    habitos_perfil queda DEPRECADO desde este punto: el modulo A pasa a leer/escribir
--    xp/oro/nivel a traves de `jugador` via el motor (lib/juego/motor.ts).
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  xp_previo int;
begin
  if not exists (select 1 from public.xp_events) then
    select xp_total into xp_previo from public.habitos_perfil limit 1;
    if xp_previo is not null and xp_previo > 0 then
      insert into public.xp_events (tipo, xp, oro, hp, meta)
      values ('ajuste', xp_previo, 0, 0, jsonb_build_object('origen', 'migracion_habitos_perfil'));

      update public.jugador
      set xp_total = xp_previo, updated_at = now()
      where id = (select id from public.jugador limit 1);
    end if;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: habilitado en todas las tablas nuevas (patron OS: acceso solo via service_role).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.xp_events enable row level security;
alter table public.jugador enable row level security;
alter table public.recompensas enable row level security;
alter table public.quests enable row level security;

grant all on
  public.xp_events,
  public.jugador,
  public.recompensas,
  public.quests
to service_role;

notify pgrst, 'reload schema';
