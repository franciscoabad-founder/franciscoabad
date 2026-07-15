-- Seed de 2 rutinas guiadas de estiramiento para Salud OS. Idempotente por nombre.
-- pasos: [{ nombre, detalle, duracion_seg, por_lado }]

insert into public.rutinas_estiramiento (nombre, descripcion, pasos)
select 'Post-entreno 5 min', 'Estiramiento estático para después de entrenar. 5 minutos.',
  '[
    {"nombre":"Cuádriceps de pie","detalle":"Lleva el talón al glúteo, rodilla apuntando al piso.","duracion_seg":30,"por_lado":true},
    {"nombre":"Isquiotibiales","detalle":"Pierna estirada al frente, inclina el torso manteniendo espalda recta.","duracion_seg":30,"por_lado":true},
    {"nombre":"Pectoral en marco de puerta","detalle":"Antebrazo apoyado, gira el torso hacia afuera.","duracion_seg":30,"por_lado":true},
    {"nombre":"Estiramiento de dorsal","detalle":"Brazo arriba, inclina el torso al lado contrario.","duracion_seg":30,"por_lado":true},
    {"nombre":"Glúteo tumbado (figura 4)","detalle":"Tobillo sobre la rodilla opuesta, acerca el muslo al pecho.","duracion_seg":30,"por_lado":true},
    {"nombre":"Gato-camello","detalle":"En cuatro apoyos, alterna arquear y redondear la espalda.","duracion_seg":40,"por_lado":false}
  ]'::jsonb
where not exists (select 1 from public.rutinas_estiramiento r where r.nombre = 'Post-entreno 5 min');

insert into public.rutinas_estiramiento (nombre, descripcion, pasos)
select 'Movilidad matutina 8 min', 'Rutina de movilidad para empezar el día. 8 minutos.',
  '[
    {"nombre":"Rotación de cuello","detalle":"Círculos lentos en ambos sentidos.","duracion_seg":40,"por_lado":false},
    {"nombre":"Círculos de hombros","detalle":"Hacia adelante y hacia atrás, amplios.","duracion_seg":40,"por_lado":false},
    {"nombre":"Rotación de cadera","detalle":"Manos en la cintura, círculos amplios.","duracion_seg":40,"por_lado":false},
    {"nombre":"Balanceo de piernas","detalle":"Apóyate en la pared, balancea al frente y atrás.","duracion_seg":30,"por_lado":true},
    {"nombre":"Sentadilla profunda sostenida","detalle":"Baja a sentadilla completa y respira, abre rodillas con los codos.","duracion_seg":45,"por_lado":false},
    {"nombre":"Rotación torácica en cuadrupedia","detalle":"Mano en la nuca, abre el codo hacia el techo.","duracion_seg":30,"por_lado":true},
    {"nombre":"Estocada con rotación","detalle":"En zancada, gira el torso hacia la pierna delantera.","duracion_seg":30,"por_lado":true},
    {"nombre":"Perro boca abajo a plancha","detalle":"Alterna entre las dos posiciones con respiración.","duracion_seg":45,"por_lado":false}
  ]'::jsonb
where not exists (select 1 from public.rutinas_estiramiento r where r.nombre = 'Movilidad matutina 8 min');

notify pgrst, 'reload schema';
