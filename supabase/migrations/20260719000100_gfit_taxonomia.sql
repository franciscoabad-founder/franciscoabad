-- GFIT: tablas de taxonomia bilingue (ES/EN) para los filtros de la biblioteca
-- de ejercicios. Fuente exacta: plan maestro OS Clay + GFIT, seccion
-- "Taxonomia EQUIPO/PATRONES/MUSCULOS" (dictada por Pancho).
-- Patron OS (Molde A): RLS habilitado sin politicas, acceso solo via service_role.

create table if not exists public.gfit_taxonomia (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('equipo','patron','grupo_muscular','sub_musculo')),
  slug text not null,
  nombre_en text not null,
  nombre_es text not null,
  padre_slug text,        -- categoria (equipo) o grupo muscular (sub_musculo); null si no aplica
  orden smallint,
  unique (tipo, slug)
);
create index if not exists gfit_taxonomia_tipo_idx on public.gfit_taxonomia(tipo);
create index if not exists gfit_taxonomia_padre_idx on public.gfit_taxonomia(padre_slug);

-- ─────────────────────────────────────────────────────────────────────────────
-- EQUIPO: 7 categorias + sus items (padre_slug = slug de la categoria).
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.gfit_taxonomia (tipo, slug, nombre_en, nombre_es, padre_slug, orden) values
  -- Categorias
  ('equipo', 'free-weights',    'Free weights',    'Pesos libres',        null, 1),
  ('equipo', 'benches',         'Benches',         'Bancos',              null, 2),
  ('equipo', 'racks',           'Racks',           'Racks',               null, 3),
  ('equipo', 'attachments',     'Attachments',     'Accesorios',          null, 4),
  ('equipo', 'weight-machines', 'Weight machines', 'Maquinas de peso',    null, 5),
  ('equipo', 'cardio-machines', 'Cardio machines', 'Maquinas de cardio',  null, 6),
  ('equipo', 'other',           'Other',           'Otros',               null, 7),

  -- Free weights
  ('equipo', 'barbell',       'Barbell',        'Barra',              'free-weights', 1),
  ('equipo', 'dumbbells',     'Dumbbells',      'Mancuernas',         'free-weights', 2),
  ('equipo', 'ez-bar',        'EZ bar',         'Barra EZ',           'free-weights', 3),
  ('equipo', 'kettlebells',   'Kettlebells',    'Pesas rusas',        'free-weights', 4),
  ('equipo', 'trap-bar',      'Trap/hex bar',   'Barra hexagonal',    'free-weights', 5),
  ('equipo', 'weight-plates', 'Weight plates',  'Discos',             'free-weights', 6),

  -- Benches
  ('equipo', 'decline-bench',      'Decline bench',                    'Banco declinado',                     'benches', 1),
  ('equipo', 'flat-bench',         'Flat bench',                       'Banco plano',                          'benches', 2),
  ('equipo', 'incline-bench',      'Incline bench',                    'Banco inclinado',                      'benches', 3),
  ('equipo', 'preacher-bench',     'Preacher curl bench',              'Banco Scott',                          'benches', 4),
  ('equipo', 'reverse-hyper-bench','Reverse hyper / back extension',   'Banco de hiperextension',              'benches', 5),
  ('equipo', 'seated-curl-bench',  'Seated curl utility bench',        'Banco utilitario para curl sentado',   'benches', 6),

  -- Racks
  ('equipo', 'decline-bench-station', 'Decline bench press station',           'Estacion de banco declinado',              'racks', 1),
  ('equipo', 'dip-station',           'Dip station (elbow & pull-up attach.)', 'Estacion de fondos (con agarre de dominadas)', 'racks', 2),
  ('equipo', 'flat-bench-station',    'Flat bench station',                    'Estacion de banco plano',                  'racks', 3),
  ('equipo', 'incline-bench-station', 'Incline bench press station',           'Estacion de banco inclinado',              'racks', 4),
  ('equipo', 'power-rack',            'Power rack',                            'Rack de potencia',                         'racks', 5),
  ('equipo', 'squat-rack',            'Squat rack',                            'Rack de sentadilla',                       'racks', 6),
  ('equipo', 'pull-up-bar',           'Pull-up bar',                           'Barra de dominadas',                       'racks', 7),

  -- Attachments
  ('equipo', 'ankle-strap',      'Ankle strap',       'Correa de tobillo',       'attachments', 1),
  ('equipo', 'd-handle',         'D-handle',          'Agarre en D',             'attachments', 2),
  ('equipo', 'single-handle',    'Single handle',     'Agarre simple',           'attachments', 3),
  ('equipo', 'landmine',         'Landmine',          'Landmine',                'attachments', 4),
  ('equipo', 'lat-pulldown-bar', 'Lat pulldown bar',  'Barra de jalon al pecho', 'attachments', 5),
  ('equipo', 'straight-bar',     'Straight bar',      'Barra recta',             'attachments', 6),
  ('equipo', 'tricep-rope',      'Tricep rope',       'Cuerda de triceps',       'attachments', 7),
  ('equipo', 'v-bar',            'V-bar',             'Barra V',                 'attachments', 8),

  -- Weight machines
  ('equipo', 'cable-station',              'Cable station',            'Estacion de poleas',                  'weight-machines', 1),
  ('equipo', 'back-extension-machine',     'Back extension',          'Maquina de hiperextension',           'weight-machines', 2),
  ('equipo', 'cable-crossover',            'Cable crossover',          'Cruce de poleas',                     'weight-machines', 3),
  ('equipo', 'chest-press-machine',        'Chest press',              'Maquina de press de pecho',           'weight-machines', 4),
  ('equipo', 'chest-reverse-fly-machine',  'Chest reverse fly',        'Maquina de aperturas invertidas',     'weight-machines', 5),
  ('equipo', 'dip-chin-assist',            'Dip/chin assist',          'Maquina asistida de fondos/dominadas','weight-machines', 6),
  ('equipo', 'hack-squat-machine',         'Hack squat',               'Maquina hack squat',                  'weight-machines', 7),
  ('equipo', 'hip-thrust-machine',         'Hip thrust',               'Maquina de empuje de cadera',         'weight-machines', 8),
  ('equipo', 'leg-abduction-machine',      'Leg abduction',            'Maquina de abduccion de cadera',      'weight-machines', 9),
  ('equipo', 'leg-adduction-machine',      'Leg adduction',            'Maquina de aduccion de cadera',       'weight-machines', 10),
  ('equipo', 'leg-curl-machine',           'Leg curl',                 'Maquina de curl femoral',             'weight-machines', 11),
  ('equipo', 'leg-extension-machine',      'Leg extension',            'Maquina de extension de cuadriceps',  'weight-machines', 12),
  ('equipo', 'leg-press-machine',          'Leg press',                'Prensa de piernas',                   'weight-machines', 13),
  ('equipo', 'seated-calf-raise-machine',  'Seated calf raise',        'Maquina de pantorrilla sentado',      'weight-machines', 14),
  ('equipo', 'seated-row-machine',         'Seated row',               'Maquina de remo sentado',             'weight-machines', 15),
  ('equipo', 'shoulder-press-machine',     'Shoulder press',           'Maquina de press de hombro',          'weight-machines', 16),
  ('equipo', 'smith-machine',              'Smith machine',            'Maquina Smith',                       'weight-machines', 17),
  ('equipo', 'standing-calf-raise-machine','Standing calf raise',      'Maquina de pantorrilla de pie',       'weight-machines', 18),
  ('equipo', 'other-machines',             'Other machines',           'Otras maquinas',                      'weight-machines', 19),

  -- Cardio machines
  ('equipo', 'elliptical',       'Elliptical',       'Eliptica',              'cardio-machines', 1),
  ('equipo', 'rowing-machine',   'Rowing machine',   'Maquina de remo (cardio)', 'cardio-machines', 2),
  ('equipo', 'stair-climber',    'Stair climber',    'Escaladora',            'cardio-machines', 3),
  ('equipo', 'stationary-bike',  'Stationary bike',  'Bicicleta estatica',    'cardio-machines', 4),
  ('equipo', 'treadmill',        'Treadmill',        'Caminadora',            'cardio-machines', 5),

  -- Other (incluye 'bodyweight', usado por el seed para mapear "body only")
  ('equipo', 'foam-roller',     'Foam roller',           'Rodillo de espuma',        'other', 1),
  ('equipo', 'plyo-box',        'Plyo/jump box',         'Cajon pliometrico',        'other', 2),
  ('equipo', 'tube-band',       'Tube band & handles',   'Banda tubular con agarres','other', 3),
  ('equipo', 'bosu-trainer',    'Bosu trainer',          'Bosu',                     'other', 4),
  ('equipo', 'medicine-ball',   'Medicine ball',         'Balon medicinal',          'other', 5),
  ('equipo', 'stability-ball',  'Stability ball',        'Balon de estabilidad',     'other', 6),
  ('equipo', 'bodyweight',      'Bodyweight',            'Peso corporal',            'other', 7)
on conflict (tipo, slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- PATRONES: 22 patrones de movimiento (sin jerarquia).
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.gfit_taxonomia (tipo, slug, nombre_en, nombre_es, padre_slug, orden) values
  ('patron', 'squat-lunge',              'Squat/lunge',                                  'Sentadilla/zancada',                          null, 1),
  ('patron', 'hinge',                    'Hinge',                                        'Bisagra de cadera',                           null, 2),
  ('patron', 'horizontal-push',          'Horizontal push',                              'Empuje horizontal',                           null, 3),
  ('patron', 'vertical-push',            'Vertical push',                                'Empuje vertical',                             null, 4),
  ('patron', 'horizontal-pull',          'Horizontal pull',                              'Traccion horizontal',                         null, 5),
  ('patron', 'vertical-pull',            'Vertical pull',                                'Traccion vertical',                           null, 6),
  ('patron', 'rotate-twist',             'Rotate/twist',                                 'Rotacion/giro',                               null, 7),
  ('patron', 'anti-rotate',              'Anti-rotate',                                  'Anti-rotacion',                               null, 8),
  ('patron', 'locomotion',               'Locomotion',                                   'Locomocion',                                  null, 9),
  ('patron', 'jump-land',                'Jump/land',                                    'Salto/aterrizaje',                            null, 10),
  ('patron', 'calf-ankle',               'Calf/ankle',                                   'Pantorrilla/tobillo',                         null, 11),
  ('patron', 'arm-isolation',            'Arm isolation (elbow flexion/extension)',      'Aislamiento de brazo (flexion/extension de codo)', null, 12),
  ('patron', 'shoulder-isolation',       'Shoulder isolation/scapular control',          'Aislamiento de hombro/control escapular',     null, 13),
  ('patron', 'hip-abduction-adduction',  'Hip abduction/adduction',                      'Abduccion/aduccion de cadera',                null, 14),
  ('patron', 'hip-flexion',              'Hip flexion (lower abs bias)',                 'Flexion de cadera (sesgo abdominal bajo)',    null, 15),
  ('patron', 'loaded-carry',             'Loaded carry',                                 'Carga en desplazamiento (carry)',             null, 16),
  ('patron', 'glute-isolation',          'Glute isolation (non-hinge/non-squat)',        'Aislamiento de gluteo (sin bisagra/sentadilla)', null, 17),
  ('patron', 'spinal-extension',         'Spinal extension',                             'Extension espinal',                           null, 18),
  ('patron', 'chest-isolation',          'Chest isolation (horizontal adduction)',       'Aislamiento de pecho (aduccion horizontal)',  null, 19),
  ('patron', 'spinal-flexion',           'Spinal flexion',                               'Flexion espinal',                             null, 20),
  ('patron', 'forearm-wrist',            'Forearm/wrist',                                'Antebrazo/muneca',                            null, 21),
  ('patron', 'knee-extension',           'Knee extension',                               'Extension de rodilla',                        null, 22)
on conflict (tipo, slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- MUSCULOS: 10 grupos + cardio (padre_slug null) + sub-musculos (padre_slug = grupo).
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.gfit_taxonomia (tipo, slug, nombre_en, nombre_es, padre_slug, orden) values
  ('grupo_muscular', 'abs',        'Abs',        'Abdomen',          null, 1),
  ('grupo_muscular', 'back',       'Back',       'Espalda',          null, 2),
  ('grupo_muscular', 'biceps',     'Biceps',     'Biceps',           null, 3),
  ('grupo_muscular', 'chest',      'Chest',      'Pecho',            null, 4),
  ('grupo_muscular', 'forearms',   'Forearms',   'Antebrazos',       null, 5),
  ('grupo_muscular', 'glutes',     'Glutes',     'Gluteos',          null, 6),
  ('grupo_muscular', 'shoulders',  'Shoulders',  'Hombros',          null, 7),
  ('grupo_muscular', 'triceps',    'Triceps',    'Triceps',          null, 8),
  ('grupo_muscular', 'upper-leg',  'Upper leg',  'Pierna superior',  null, 9),
  ('grupo_muscular', 'lower-leg',  'Lower leg',  'Pierna inferior',  null, 10),
  ('grupo_muscular', 'cardio',     'Cardio',     'Cardio',           null, 11)
on conflict (tipo, slug) do nothing;

insert into public.gfit_taxonomia (tipo, slug, nombre_en, nombre_es, padre_slug, orden) values
  -- Abs
  ('sub_musculo', 'deep-core',  'Deep core',  'Nucleo profundo', 'abs', 1),
  ('sub_musculo', 'lower-abs',  'Lower abs',  'Abdomen bajo',    'abs', 2),
  ('sub_musculo', 'obliques',   'Obliques',   'Oblicuos',        'abs', 3),
  ('sub_musculo', 'upper-abs',  'Upper abs',  'Abdomen alto',    'abs', 4),

  -- Back
  ('sub_musculo', 'lats',         'Lats',         'Dorsales',       'back', 1),
  ('sub_musculo', 'lower-back',   'Lower back',   'Espalda baja',   'back', 2),
  ('sub_musculo', 'middle-back',  'Middle back',  'Espalda media',  'back', 3),
  ('sub_musculo', 'traps',        'Traps',        'Trapecios',      'back', 4),
  ('sub_musculo', 'upper-back',   'Upper back',   'Espalda alta',   'back', 5),

  -- Biceps
  ('sub_musculo', 'brachialis',   'Brachialis',  'Braquial',         'biceps', 1),
  ('sub_musculo', 'biceps-inner', 'Inner',       'Biceps interno',   'biceps', 2),
  ('sub_musculo', 'biceps-outer', 'Outer',       'Biceps externo',   'biceps', 3),

  -- Chest
  ('sub_musculo', 'chest-inner',  'Inner',  'Pecho interno',  'chest', 1),
  ('sub_musculo', 'chest-lower',  'Lower',  'Pecho bajo',     'chest', 2),
  ('sub_musculo', 'chest-outer',  'Outer',  'Pecho externo',  'chest', 3),
  ('sub_musculo', 'chest-upper',  'Upper',  'Pecho alto',     'chest', 4),

  -- Forearms
  ('sub_musculo', 'forearms-inner',  'Inner',           'Antebrazo interno',   'forearms', 1),
  ('sub_musculo', 'forearms-outer',  'Outer',           'Antebrazo externo',   'forearms', 2),
  ('sub_musculo', 'forearms-top',    'Top',             'Antebrazo superior',  'forearms', 3),
  ('sub_musculo', 'brachioradialis', 'Brachioradialis', 'Braquiorradial',      'forearms', 4),

  -- Glutes
  ('sub_musculo', 'glutes-max', 'Max', 'Gluteo mayor', 'glutes', 1),
  ('sub_musculo', 'glutes-med', 'Med', 'Gluteo medio',  'glutes', 2),
  ('sub_musculo', 'glutes-min', 'Min', 'Gluteo menor',  'glutes', 3),

  -- Shoulders
  ('sub_musculo', 'shoulders-front', 'Front', 'Hombro frontal',    'shoulders', 1),
  ('sub_musculo', 'shoulders-rear',  'Rear',  'Hombro posterior',  'shoulders', 2),
  ('sub_musculo', 'shoulders-side',  'Side',  'Hombro lateral',    'shoulders', 3),

  -- Triceps
  ('sub_musculo', 'triceps-lateral-head', 'Lateral head', 'Triceps cabeza lateral', 'triceps', 1),
  ('sub_musculo', 'triceps-long-head',    'Long head',    'Triceps cabeza larga',   'triceps', 2),
  ('sub_musculo', 'triceps-medial-head',  'Medial head',  'Triceps cabeza medial',  'triceps', 3),

  -- Upper leg
  ('sub_musculo', 'hamstrings',  'Hamstrings',  'Isquiotibiales',                'upper-leg', 1),
  ('sub_musculo', 'hip-flexors', 'Hip flexors', 'Flexores de cadera',            'upper-leg', 2),
  ('sub_musculo', 'inner-thigh', 'Inner thigh', 'Aductores (muslo interno)',     'upper-leg', 3),
  ('sub_musculo', 'outer-thigh', 'Outer thigh', 'Abductores (muslo externo)',    'upper-leg', 4),
  ('sub_musculo', 'quads',       'Quads',       'Cuadriceps',                    'upper-leg', 5),

  -- Lower leg
  ('sub_musculo', 'front-shin',  'Front shin',  'Espinilla',        'lower-leg', 1),
  ('sub_musculo', 'lower-calf',  'Lower calf',  'Pantorrilla baja', 'lower-leg', 2),
  ('sub_musculo', 'upper-calf',  'Upper calf',  'Pantorrilla alta', 'lower-leg', 3)
on conflict (tipo, slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: habilitado (patron OS: acceso solo via service_role desde endpoints).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.gfit_taxonomia enable row level security;

grant all on public.gfit_taxonomia to service_role;

notify pgrst, 'reload schema';
