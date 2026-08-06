-- SUENO: modulo del OS basado en el modelo de dos procesos (Borbely, 1982).
-- Proceso S (deuda homeostatica) + Proceso C (ritmo circadiano) -> ventanas del
-- dia y plan de pago de la deuda.
-- Patron OS (Molde A): RLS habilitado sin politicas, acceso solo via service_role
-- desde los endpoints, notify pgrst al final.
--
-- Relacion con lo que ya existe:
--   - `biometricas_dia.sueno_min` (20260721000000) sigue siendo el destino del
--     sync diario de Google Health. Da DURACION pero no horarios, asi que sirve
--     para la deuda y no para anclar el Proceso C. El modulo lo usa como respaldo
--     cuando no hay sesion registrada ese dia.
--   - `cuerpo_log.sueno_horas` (20260715000000) es un campo suelto del registro
--     corporal. No se toca ni se migra: aqui vive el dato con horarios.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. sueno_config: fila unica con los parametros personales del modelo.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.sueno_config (
  id int primary key default 1,
  -- Necesidad individual de sueno. Si necesidad_auto, el endpoint la reestima
  -- desde el historico (percentil 90) y solo usa este valor como respaldo.
  necesidad_h numeric(3,1) not null default 8.0,
  necesidad_auto boolean not null default true,
  hora_dormir time not null default '23:00',
  hora_despertar time not null default '07:00',
  -- Deuda a la que se apunta. No es cero a proposito: perseguir el cero produce
  -- ansiedad, no descanso.
  deuda_objetivo_h numeric(3,1) not null default 2.0,
  siestas_ok boolean not null default true,
  -- Vida media de la cafeina: 5-6 h tipico, rango real 2-12 h segun CYP1A2.
  cafeina_vida_media_h numeric(3,1) not null default 5.7,
  cafeina_umbral_mg int not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sueno_config_singleton check (id = 1),
  constraint sueno_config_necesidad_rango check (necesidad_h between 4 and 12),
  constraint sueno_config_vida_media_rango check (cafeina_vida_media_h between 1 and 12)
);

insert into public.sueno_config (id) values (1) on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. sueno_sesiones: cada episodio de sueno con horarios reales.
--    `fecha` es el dia al que se ACREDITA el sueno, es decir el de despertar:
--    dormirse el 5 a las 23:00 y despertar el 6 a las 07:00 acredita 480 min al 6.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.sueno_sesiones (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  inicio timestamptz not null,
  fin timestamptz not null,
  -- Minutos DORMIDOS (puede ser menor que fin-inicio: los wearables descuentan
  -- los despertares). Si no viene, el endpoint usa fin-inicio.
  minutos int not null,
  siesta boolean not null default false,
  calidad int,                                    -- 1..5 subjetivo, opcional
  fuente text not null default 'manual',          -- manual | google_health | fitbit | n8n
  raw jsonb,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sueno_sesiones_rango check (fin > inicio),
  constraint sueno_sesiones_minutos check (minutos > 0 and minutos <= 1440),
  constraint sueno_sesiones_calidad check (calidad is null or calidad between 1 and 5)
);

-- Idempotencia del sync externo: reenviar la misma sesion actualiza, no duplica.
create unique index if not exists sueno_sesiones_inicio_key on public.sueno_sesiones(inicio);
create index if not exists sueno_sesiones_fecha_idx on public.sueno_sesiones(fecha desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. cafeina_log: dosis con hora, para el decaimiento y la hora de corte.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.cafeina_log (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  tomado_at timestamptz not null,
  mg int not null,
  bebida text,
  fuente text not null default 'manual',
  created_at timestamptz not null default now(),
  constraint cafeina_log_mg check (mg > 0 and mg <= 1000)
);

create index if not exists cafeina_log_fecha_idx on public.cafeina_log(fecha desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS + grants (patron OS).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.sueno_config   enable row level security;
alter table public.sueno_sesiones enable row level security;
alter table public.cafeina_log    enable row level security;

grant all on
  public.sueno_config,
  public.sueno_sesiones,
  public.cafeina_log
to service_role;

notify pgrst, 'reload schema';
