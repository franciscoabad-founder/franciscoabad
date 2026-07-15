-- Migra los registros existentes de la tabla `comidas` a `comidas_log` como entradas
-- cualitativas (descripcion_libre + macros ya capturados si existían; sin recalcular).
-- Idempotente: solo inserta comidas cuyo id no haya sido migrado antes.
-- La tabla `comidas` NO se borra (el módulo la absorbe; /os/comidas redirige por app).

-- Guardamos el id de origen para no duplicar en corridas repetidas.
alter table public.comidas_log add column if not exists origen_comida_id uuid;
create unique index if not exists comidas_log_origen_uniq
  on public.comidas_log(origen_comida_id) where origen_comida_id is not null;

insert into public.comidas_log
  (fecha, momento, descripcion_libre, kcal, proteina_g, carbos_g, grasa_g,
   foto_url, source, tipo_dia, notas, created_at, origen_comida_id)
select
  (c.fecha at time zone 'America/Guayaquil')::date as fecha,
  case
    when lower(coalesce(c.momento, '')) in ('desayuno','almuerzo','cena','snack')
      then lower(c.momento)
    else 'snack'
  end as momento,
  c.descripcion,
  c.kcal,
  c.proteina_g,
  c.carbos_g,
  c.grasa_g,
  c.foto_url,
  'manual' as source,
  'normal' as tipo_dia,
  c.notas,
  c.fecha as created_at,
  c.id as origen_comida_id
from public.comidas c
where not exists (
  select 1 from public.comidas_log l where l.origen_comida_id = c.id
);

notify pgrst, 'reload schema';
