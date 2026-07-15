-- Seed del catalogo de journeys (plan A.4) y del pack Fabulous minimo de habitos sueltos.
-- Idempotente: journeys por slug, etapas por (journey_id, orden), habitos sueltos por
-- nombre. Solo "El Arranque" y "One Domino" traen sus 3 etapas completas (gate de fase 2);
-- los otros 6 journeys quedan sembrados solo como fila, sus etapas llegan en fase posterior.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Catalogo de journeys (8): montana, orden global y estado inicial.
--    Unico disponible al arranque es "El Arranque"; el resto empieza bloqueado.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.journeys (slug, nombre, descripcion, montana, orden, estado)
select * from (values
  ('el-arranque', 'El Arranque',
   'Replica de "An Unexpected Journey" de Fabulous: arranca con un habito ridiculamente facil, tomar agua al despertar, y va tejiendo el ritual matutino completo.',
   'foundations', 1, 'disponible'),
  ('one-domino', 'One Domino',
   'Un domino a la vez: definir la prioridad en el cierre PM, atacar lo incomodo antes de mediodia, y respetar el modo Maker o Manager segun el dia.',
   'foundations', 2, 'bloqueado'),
  ('dormir-como-founder', 'Dormir como founder',
   'Horario de sueno consistente, telefono fuera del cuarto, luz solar en la manana. Se auto-verifica con el registro de cuerpo.',
   'foundations', 3, 'bloqueado'),
  ('cuerpo-de-founder', 'Cuerpo de founder',
   'Entrenar segun la rutina, con la version minima de 2 minutos contando como cumplido. Si falla un dia, no falla dos.',
   'struggle', 4, 'bloqueado'),
  ('finanzas-con-honestidad', 'Finanzas con honestidad',
   'Ritual de viernes de 20 minutos, registro diario de gastos, y avalancha de deuda con income first.',
   'struggle', 5, 'bloqueado'),
  ('maquina-de-contenido', 'Maquina de contenido',
   'Publicar al 70% en vez de esperar la perfeccion, cadencia semanal en LinkedIn e Instagram, batch de sabado y newsletter de viernes.',
   'struggle', 6, 'bloqueado'),
  ('monetizar-como-sistema', 'Monetizar como sistema',
   'Outreach en los dias Manager, revision de pipeline en el CRM, y seguimiento disciplinado de cada oportunidad.',
   'mastery', 7, 'bloqueado'),
  ('mente-antifragil', 'Mente antifragil',
   'Reencuadre de estres al estilo Sistema 1 / Sistema 2 de Kahneman, con la revision semanal como ritual de cierre (peak-end).',
   'mastery', 8, 'bloqueado')
) as v(slug, nombre, descripcion, montana, orden, estado)
where not exists (select 1 from public.journeys j where j.slug = v.slug);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Etapas de "El Arranque" (3): keystone de agua, ancla AM, ritual completo.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.journey_etapas (journey_id, orden, nombre, contenido_slug, habitos_desbloquea, criterio)
select j.id, x.orden, x.nombre, x.contenido_slug, x.habitos_desbloquea::jsonb, x.criterio::jsonb
from public.journeys j
cross join lateral (values
  (1, 'Tomar agua al despertar', 'el-arranque/agua-al-despertar',
   '[{"nombre":"Tomar agua al despertar","tipo":"diaria","dificultad":"trivial","dias_semana":[1,2,3,4,5,6,7],"intencion":"Al abrir los ojos, la botella que dejaste anoche junto a la cama","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Tomar agua al despertar","meta":3,"ventana_dias":5}'),
  (2, 'Ancla AM', 'el-arranque/ancla-am',
   '[{"nombre":"Moverse 2 minutos","tipo":"diaria","dificultad":"trivial","dias_semana":[1,2,3,4,5,6,7],"intencion":"Justo despues de tomar agua, estirar o caminar 2 minutos","es_core":false},{"nombre":"30 minutos sin telefono al despertar","tipo":"diaria","dificultad":"facil","dias_semana":[1,2,3,4,5,6,7],"intencion":"El telefono se queda cargando fuera del cuarto hasta pasados 30 minutos de despertar","es_core":true}]',
   '{"tipo":"checks","habito_nombre":"30 minutos sin telefono al despertar","meta":5,"ventana_dias":7}'),
  (3, 'Ritual completo con brain dump', 'el-arranque/ritual-completo',
   '[{"nombre":"Brain dump matutino","tipo":"diaria","dificultad":"facil","dias_semana":[1,2,3,4,5,6,7],"intencion":"Con el cafe en la mano, 3 minutos escribiendo todo lo que ronda la cabeza antes de abrir el celular","es_core":true}]',
   '{"tipo":"checks","habito_nombre":"Brain dump matutino","meta":7,"ventana_dias":10}')
) as x(orden, nombre, contenido_slug, habitos_desbloquea, criterio)
where j.slug = 'el-arranque'
  and not exists (
    select 1 from public.journey_etapas je where je.journey_id = j.id and je.orden = x.orden
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Etapas de "One Domino" (3): domino de manana, Discomfort First, Maker/Manager.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.journey_etapas (journey_id, orden, nombre, contenido_slug, habitos_desbloquea, criterio)
select j.id, x.orden, x.nombre, x.contenido_slug, x.habitos_desbloquea::jsonb, x.criterio::jsonb
from public.journeys j
cross join lateral (values
  (1, 'Definir el domino de manana', 'one-domino/definir-domino',
   '[{"nombre":"Definir el domino de manana","tipo":"diaria","dificultad":"facil","dias_semana":[1,2,3,4,5,6,7],"intencion":"En el cierre PM, antes de cerrar la laptop, escribir la unica prioridad de manana","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Definir el domino de manana","meta":3,"ventana_dias":5}'),
  (2, 'Discomfort First antes de mediodia', 'one-domino/discomfort-first',
   '[{"nombre":"Discomfort First","tipo":"diaria","dificultad":"media","dias_semana":[1,2,3,4,5],"intencion":"Antes de las 12pm, la tarea que mas evito del dia","es_core":true}]',
   '{"tipo":"checks","habito_nombre":"Discomfort First","meta":4,"ventana_dias":7}'),
  (3, 'Respetar el modo del dia Maker/Manager', 'one-domino/maker-manager',
   '[{"nombre":"Respetar el modo del dia","tipo":"diaria","dificultad":"media","dias_semana":[1,2,3,4,5],"intencion":"Al planear el dia, revisar si es Maker o Manager y no cambiar de chip a mitad de dia","es_core":false}]',
   '{"tipo":"checks","habito_nombre":"Respetar el modo del dia","meta":5,"ventana_dias":7}')
) as x(orden, nombre, contenido_slug, habitos_desbloquea, criterio)
where j.slug = 'one-domino'
  and not exists (
    select 1 from public.journey_etapas je where je.journey_id = j.id and je.orden = x.orden
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Habitos sueltos del arranque (pack Fabulous minimo, fuera de journeys).
--    "Tomar agua al despertar" NO se siembra aqui: se crea cuando Pancho inicie el
--    journey El Arranque (POST journeys {iniciar: 'el-arranque'} lo crea desde la etapa 1).
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.habitos (nombre, descripcion, tipo, permite_mas, permite_menos, dificultad, dias_semana, intencion, es_core, en_checklist)
select * from (values
  ('Preparar el dia la noche anterior',
   'Dejar listo el entorno para que manana sea facil empezar (diseno de entorno, Fabulous/Clear).',
   'diaria', true, false, 'facil', array[1,2,3,4,5,6,7]::smallint[],
   'Antes de dormir: botella de agua lista y domino de manana escrito', false, true),
  ('Doomscrolling',
   'Habito negativo de ejemplo: scroll sin proposito en redes sociales. Registrar cada vez que se detecta.',
   'habito', false, true, 'facil', array[1,2,3,4,5,6,7]::smallint[],
   null, false, false)
) as v(nombre, descripcion, tipo, permite_mas, permite_menos, dificultad, dias_semana, intencion, es_core, en_checklist)
where not exists (select 1 from public.habitos h where h.nombre = v.nombre);

notify pgrst, 'reload schema';
