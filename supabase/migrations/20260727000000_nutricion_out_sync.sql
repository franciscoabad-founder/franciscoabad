-- Nutricion OUT: columnas de sincronizacion para empujar comidas del OS hacia
-- Google Health (data type `nutrition-log`) o, si esa escritura no funciona,
-- hacia el food log de la Fitbit Web API legacy.
--
-- Patron OS (Molde A): RLS ya habilitado en comidas_log desde
-- 20260715000000_salud_os_schema.sql, acceso solo via service_role desde los
-- endpoints. Aqui solo se agregan columnas e indices.
--
-- Direccion del flujo: Supabase es la fuente de verdad. La comida se registra
-- primero en comidas_log y DESPUES un flujo n8n la empuja hacia afuera. La
-- lectura (sueno, pasos, peso, fc) va por biometricas_dia y no toca esta tabla:
-- nutricion es la unica categoria 2-way, y encima es de una sola via hacia
-- afuera, porque la Google Health API v4 no expone lectura de nutricion (no
-- existe el scope googlehealth.nutrition.readonly, verificado contra el
-- discovery document rev. 20260722).

alter table public.comidas_log
  -- 'google_health' | 'fitbit'. Null mientras no se haya intentado empujar.
  add column if not exists sync_destino text,
  -- Id del data point en el sistema externo. Para Google Health es el propio
  -- id (uuid) de esta fila: la API acepta ids de data point provistos por el
  -- cliente (4-63 chars, minusculas/digitos/guiones), y un uuid cumple. Eso da
  -- idempotencia por construccion: reenviar la misma comida apunta al mismo
  -- data point en vez de crear uno nuevo.
  add column if not exists sync_external_id text,
  add column if not exists sync_estado text
    check (sync_estado in ('pendiente', 'enviado', 'error', 'omitido'))
    default 'pendiente',
  add column if not exists sync_intentos smallint not null default 0,
  add column if not exists sync_error text,
  add column if not exists sync_at timestamptz,
  -- Respuesta cruda del sistema externo. La documentacion de Google advierte
  -- que la API v4 esta evolucionando: guardar el payload original permite
  -- reprocesar cuando cambien un campo, sin haber perdido nada.
  add column if not exists sync_raw jsonb;

-- Cola de salida: el flujo n8n drena por aqui. Parcial para que el indice no
-- cargue el historico ya enviado.
create index if not exists comidas_log_sync_pendiente_idx
  on public.comidas_log (created_at)
  where sync_estado = 'pendiente';

-- Idempotencia por la pareja destino + id externo. Parcial porque las filas sin
-- empujar tienen las dos columnas en null.
create unique index if not exists comidas_log_sync_externo_uniq
  on public.comidas_log (sync_destino, sync_external_id)
  where sync_destino is not null and sync_external_id is not null;

-- El historico anterior a esta migracion NO se empuja. Sin esto, el primer run
-- del flujo intentaria subir todas las comidas registradas desde el 15 jul.
update public.comidas_log
  set sync_estado = 'omitido'
  where sync_estado = 'pendiente'
    and created_at < now();

notify pgrst, 'reload schema';
