-- Seed de las etapas de los 6 journeys restantes del catalogo (plan A.4, fase posterior):
-- dormir-como-founder, cuerpo-de-founder, finanzas-con-honestidad, maquina-de-contenido,
-- monetizar-como-sistema, mente-antifragil. Mismo formato del seed original: idempotente
-- por (journey_id, orden), habitos_desbloquea jsonb, criterio jsonb.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Etapas de "Dormir como founder" (3): horario fijo, telefono fuera, luz solar AM.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.journey_etapas (journey_id, orden, nombre, contenido_slug, habitos_desbloquea, criterio)
select j.id, x.orden, x.nombre, x.contenido_slug, x.habitos_desbloquea::jsonb, x.criterio::jsonb
from public.journeys j
cross join lateral (values
  (1, 'Horario fijo para dormir', 'dormir-como-founder/horario-fijo',
   '[{"nombre":"Acostarme a la misma hora","tipo":"diaria","dificultad":"trivial","dias_semana":[1,2,3,4,5,6,7],"intencion":"Apagar la luz dentro de una ventana de 30 minutos alrededor de mi hora fija","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Acostarme a la misma hora","meta":3,"ventana_dias":5}'),
  (2, 'Telefono fuera del cuarto', 'dormir-como-founder/telefono-fuera',
   '[{"nombre":"Telefono fuera del cuarto","tipo":"diaria","dificultad":"facil","dias_semana":[1,2,3,4,5,6,7],"intencion":"Antes de mi hora de dormir, dejar el telefono cargando fuera del cuarto","es_core":true}]',
   '{"tipo":"checks","habito_nombre":"Telefono fuera del cuarto","meta":5,"ventana_dias":7}'),
  (3, 'Luz solar al despertar', 'dormir-como-founder/luz-solar-am',
   '[{"nombre":"Buscar luz solar al despertar","tipo":"diaria","dificultad":"facil","dias_semana":[1,2,3,4,5,6,7],"intencion":"Dentro de los primeros 30 minutos de despertar, buscar luz solar directa","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Buscar luz solar al despertar","meta":7,"ventana_dias":10}')
) as x(orden, nombre, contenido_slug, habitos_desbloquea, criterio)
where j.slug = 'dormir-como-founder'
  and not exists (
    select 1 from public.journey_etapas je where je.journey_id = j.id and je.orden = x.orden
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Etapas de "Cuerpo de founder" (3): version minima, dias fijos, no fallar dos.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.journey_etapas (journey_id, orden, nombre, contenido_slug, habitos_desbloquea, criterio)
select j.id, x.orden, x.nombre, x.contenido_slug, x.habitos_desbloquea::jsonb, x.criterio::jsonb
from public.journeys j
cross join lateral (values
  (1, 'Version minima de 2 minutos', 'cuerpo-de-founder/version-minima',
   '[{"nombre":"Moverme al menos 2 minutos","tipo":"diaria","dificultad":"trivial","dias_semana":[1,2,3,4,5,6,7],"intencion":"Si no hago la sesion completa, al menos 2 minutos de movimiento cuentan como cumplido","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Moverme al menos 2 minutos","meta":3,"ventana_dias":5}'),
  (2, 'Entrenar en dias fijos', 'cuerpo-de-founder/dias-fijos',
   '[{"nombre":"Entrenar en mi dia fijo","tipo":"diaria","dificultad":"media","dias_semana":[1,3,5],"intencion":"En los dias que ya marque como dias de entrenar en mi calendario, entrenar sin renegociar","es_core":true}]',
   '{"tipo":"checks","habito_nombre":"Entrenar en mi dia fijo","meta":4,"ventana_dias":7}'),
  (3, 'Si falla un dia, no falla dos', 'cuerpo-de-founder/no-fallar-dos',
   '[{"nombre":"No fallar dos dias seguidos","tipo":"diaria","dificultad":"media","dias_semana":[1,2,3,4,5,6,7],"intencion":"Si ayer no entrene, hoy entreno si o si, aunque sea el minimo","es_core":true}]',
   '{"tipo":"checks","habito_nombre":"No fallar dos dias seguidos","meta":6,"ventana_dias":10}')
) as x(orden, nombre, contenido_slug, habitos_desbloquea, criterio)
where j.slug = 'cuerpo-de-founder'
  and not exists (
    select 1 from public.journey_etapas je where je.journey_id = j.id and je.orden = x.orden
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Etapas de "Finanzas con honestidad" (3): ritual viernes, registro diario, avalancha.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.journey_etapas (journey_id, orden, nombre, contenido_slug, habitos_desbloquea, criterio)
select j.id, x.orden, x.nombre, x.contenido_slug, x.habitos_desbloquea::jsonb, x.criterio::jsonb
from public.journeys j
cross join lateral (values
  (1, 'Ritual de viernes', 'finanzas-con-honestidad/ritual-viernes',
   '[{"nombre":"Ritual de viernes de 20 minutos","tipo":"diaria","dificultad":"facil","dias_semana":[5],"intencion":"Cada viernes, 20 minutos frente a las 4 hojas de honestidad financiera","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Ritual de viernes de 20 minutos","meta":2,"ventana_dias":14}'),
  (2, 'Registro diario de gastos', 'finanzas-con-honestidad/registro-diario',
   '[{"nombre":"Registrar gastos del dia","tipo":"diaria","dificultad":"facil","dias_semana":[1,2,3,4,5,6,7],"intencion":"El mismo dia, anotar lo que gaste antes de que se me olvide","es_core":true}]',
   '{"tipo":"checks","habito_nombre":"Registrar gastos del dia","meta":5,"ventana_dias":7}'),
  (3, 'Avalancha de deuda', 'finanzas-con-honestidad/avalancha',
   '[{"nombre":"Pago extra a deuda de mayor tasa","tipo":"diaria","dificultad":"media","dias_semana":[5],"intencion":"Cada viernes, revisar la deuda con mayor tasa y hacerle un pago extra, income first","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Pago extra a deuda de mayor tasa","meta":3,"ventana_dias":21}')
) as x(orden, nombre, contenido_slug, habitos_desbloquea, criterio)
where j.slug = 'finanzas-con-honestidad'
  and not exists (
    select 1 from public.journey_etapas je where je.journey_id = j.id and je.orden = x.orden
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Etapas de "Maquina de contenido" (3): publicar al 70%, cadencia, batch sabado.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.journey_etapas (journey_id, orden, nombre, contenido_slug, habitos_desbloquea, criterio)
select j.id, x.orden, x.nombre, x.contenido_slug, x.habitos_desbloquea::jsonb, x.criterio::jsonb
from public.journeys j
cross join lateral (values
  (1, 'Publicar al 70%', 'maquina-de-contenido/publicar-al-70',
   '[{"nombre":"Publicar 1 pieza imperfecta","tipo":"diaria","dificultad":"media","dias_semana":[1,2,3,4,5,6,7],"intencion":"Publicar una pieza de contenido cuando llegue al 70%, no cuando este perfecta","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Publicar 1 pieza imperfecta","meta":2,"ventana_dias":14}'),
  (2, 'Cadencia semanal', 'maquina-de-contenido/cadencia',
   '[{"nombre":"Publicar segun cadencia semanal","tipo":"diaria","dificultad":"media","dias_semana":[1,2,3,4,5],"intencion":"Publicar en LinkedIn o Instagram segun el dia que ya defini en mi calendario de contenido","es_core":true}]',
   '{"tipo":"checks","habito_nombre":"Publicar segun cadencia semanal","meta":4,"ventana_dias":7}'),
  (3, 'Batch de sabado y newsletter de viernes', 'maquina-de-contenido/batch-sabado',
   '[{"nombre":"Batch de sabado y newsletter","tipo":"diaria","dificultad":"media","dias_semana":[5,6],"intencion":"Sabado, bloque de batch para producir la semana; viernes, newsletter enviada","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Batch de sabado y newsletter","meta":4,"ventana_dias":14}')
) as x(orden, nombre, contenido_slug, habitos_desbloquea, criterio)
where j.slug = 'maquina-de-contenido'
  and not exists (
    select 1 from public.journey_etapas je where je.journey_id = j.id and je.orden = x.orden
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Etapas de "Monetizar como sistema" (3): outreach manager, pipeline viernes, seguimiento.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.journey_etapas (journey_id, orden, nombre, contenido_slug, habitos_desbloquea, criterio)
select j.id, x.orden, x.nombre, x.contenido_slug, x.habitos_desbloquea::jsonb, x.criterio::jsonb
from public.journeys j
cross join lateral (values
  (1, 'Outreach en dias Manager', 'monetizar-como-sistema/outreach-manager',
   '[{"nombre":"3 contactos de outreach","tipo":"diaria","dificultad":"media","dias_semana":[2,4],"intencion":"En mis dias Manager, hacer 3 contactos de outreach: mensaje, correo o llamada","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"3 contactos de outreach","meta":3,"ventana_dias":7}'),
  (2, 'Revision de pipeline los viernes', 'monetizar-como-sistema/pipeline-viernes',
   '[{"nombre":"Revisar pipeline en el CRM","tipo":"diaria","dificultad":"facil","dias_semana":[5],"intencion":"Cada viernes, revisar cada oportunidad activa y definir la siguiente accion","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Revisar pipeline en el CRM","meta":2,"ventana_dias":14}'),
  (3, 'Cero leads sin respuesta', 'monetizar-como-sistema/seguimiento',
   '[{"nombre":"Responder leads en menos de 48h","tipo":"diaria","dificultad":"media","dias_semana":[1,2,3,4,5,6,7],"intencion":"Ningun lead se queda sin respuesta mia por mas de 48 horas","es_core":true}]',
   '{"tipo":"checks","habito_nombre":"Responder leads en menos de 48h","meta":5,"ventana_dias":7}')
) as x(orden, nombre, contenido_slug, habitos_desbloquea, criterio)
where j.slug = 'monetizar-como-sistema'
  and not exists (
    select 1 from public.journey_etapas je where je.journey_id = j.id and je.orden = x.orden
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Etapas de "Mente antifragil" (3): revision semanal, reencuadre, peak-end.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.journey_etapas (journey_id, orden, nombre, contenido_slug, habitos_desbloquea, criterio)
select j.id, x.orden, x.nombre, x.contenido_slug, x.habitos_desbloquea::jsonb, x.criterio::jsonb
from public.journeys j
cross join lateral (values
  (1, 'Revision semanal', 'mente-antifragil/revision-semanal',
   '[{"nombre":"Ritual de revision semanal","tipo":"diaria","dificultad":"facil","dias_semana":[5],"intencion":"Cada viernes, un bloque fijo para revisar que funciono y que no de la semana","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Ritual de revision semanal","meta":2,"ventana_dias":14}'),
  (2, 'Reencuadre de estres', 'mente-antifragil/reencuadre',
   '[{"nombre":"Anotar estresor y reencuadre","tipo":"diaria","dificultad":"media","dias_semana":[1,2,3,4,5,6,7],"intencion":"Cuando algo me estrese, anotar el evento y un reencuadre de Sistema 1 a Sistema 2","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Anotar estresor y reencuadre","meta":4,"ventana_dias":7}'),
  (3, 'Peak-end del dia', 'mente-antifragil/peak-end',
   '[{"nombre":"Anotar el mejor momento del dia","tipo":"diaria","dificultad":"trivial","dias_semana":[1,2,3,4,5,6,7],"intencion":"Antes de dormir, anotar en una linea cual fue el mejor momento del dia","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Anotar el mejor momento del dia","meta":7,"ventana_dias":10}')
) as x(orden, nombre, contenido_slug, habitos_desbloquea, criterio)
where j.slug = 'mente-antifragil'
  and not exists (
    select 1 from public.journey_etapas je where je.journey_id = j.id and je.orden = x.orden
  );

notify pgrst, 'reload schema';
