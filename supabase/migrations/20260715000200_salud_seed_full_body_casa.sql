-- Seed de ejemplo para Salud OS: 4 ejercicios de peso corporal + rutina "Full Body Casa".
-- Permite recorrer el modo sesión activa sin depender del seed de wger.
-- Idempotente: usa where not exists por nombre + fuente 'personal'.

-- 1. Ejercicios de peso corporal (fuente personal).
insert into public.ejercicios (nombre, nombre_en, grupo_muscular_primario, secundarios, patron, equipamiento, instrucciones, fuente)
select * from (values
  ('Sentadilla', 'Bodyweight Squat', 'Piernas', '["Glúteos","Core"]'::jsonb, 'squat', 'Ninguno',
   'De pie, pies al ancho de hombros. Baja flexionando rodillas y cadera manteniendo la espalda recta hasta que los muslos queden paralelos al piso. Sube empujando con los talones.', 'personal'),
  ('Flexión de pecho', 'Push-up', 'Pecho', '["Tríceps","Hombros","Core"]'::jsonb, 'push_h', 'Ninguno',
   'En plancha con manos al ancho de hombros. Baja el pecho hacia el piso manteniendo el cuerpo recto y sube extendiendo los codos.', 'personal'),
  ('Plancha', 'Plank', 'Core', '["Hombros","Glúteos"]'::jsonb, 'core', 'Ninguno',
   'Apoya antebrazos y puntas de los pies. Mantén el cuerpo en línea recta activando el abdomen. Sostén el tiempo objetivo.', 'personal'),
  ('Zancada', 'Lunge', 'Piernas', '["Glúteos","Core"]'::jsonb, 'squat', 'Ninguno',
   'Da un paso al frente y baja la rodilla trasera hacia el piso manteniendo el torso erguido. Alterna piernas.', 'personal')
) as v(nombre, nombre_en, grupo_muscular_primario, secundarios, patron, equipamiento, instrucciones, fuente)
where not exists (
  select 1 from public.ejercicios e where e.nombre = v.nombre and e.fuente = 'personal'
);

-- 2. Rutina "Full Body Casa".
insert into public.rutinas (nombre, descripcion, dias)
select 'Full Body Casa', 'Rutina de cuerpo completo con peso corporal, sin equipamiento.', '["lunes","miercoles","viernes"]'::jsonb
where not exists (select 1 from public.rutinas r where r.nombre = 'Full Body Casa');

-- 3. Ejercicios de la rutina con sets tipados (3 working sets por ejercicio, plancha por tiempo).
insert into public.rutina_ejercicios (rutina_id, ejercicio_id, orden, sets_plan)
select
  r.id,
  e.id,
  x.orden,
  x.sets_plan::jsonb
from public.rutinas r
cross join lateral (values
  (0, 'Sentadilla',        '[{"tipo":"working","reps_min":10,"reps_max":15,"peso_objetivo":0,"descanso_seg":75},{"tipo":"working","reps_min":10,"reps_max":15,"peso_objetivo":0,"descanso_seg":75},{"tipo":"working","reps_min":10,"reps_max":15,"peso_objetivo":0,"descanso_seg":75}]'),
  (1, 'Flexión de pecho',  '[{"tipo":"working","reps_min":8,"reps_max":12,"peso_objetivo":0,"descanso_seg":75},{"tipo":"working","reps_min":8,"reps_max":12,"peso_objetivo":0,"descanso_seg":75},{"tipo":"working","reps_min":8,"reps_max":12,"peso_objetivo":0,"descanso_seg":75}]'),
  (2, 'Zancada',           '[{"tipo":"working","reps_min":10,"reps_max":12,"peso_objetivo":0,"descanso_seg":75},{"tipo":"working","reps_min":10,"reps_max":12,"peso_objetivo":0,"descanso_seg":75},{"tipo":"working","reps_min":10,"reps_max":12,"peso_objetivo":0,"descanso_seg":75}]'),
  (3, 'Plancha',           '[{"tipo":"working","reps_min":30,"reps_max":60,"peso_objetivo":0,"descanso_seg":60},{"tipo":"working","reps_min":30,"reps_max":60,"peso_objetivo":0,"descanso_seg":60},{"tipo":"working","reps_min":30,"reps_max":60,"peso_objetivo":0,"descanso_seg":60}]')
) as x(orden, nombre, sets_plan)
join public.ejercicios e on e.nombre = x.nombre and e.fuente = 'personal'
where r.nombre = 'Full Body Casa'
  and not exists (
    select 1 from public.rutina_ejercicios re
    where re.rutina_id = r.id and re.ejercicio_id = e.id
  );

notify pgrst, 'reload schema';
