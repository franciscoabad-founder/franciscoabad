/**
 * seed-gfit-ejercicios.mjs
 *
 * Script Node ejecutable MANUALMENTE (NO en build) que descarga el catalogo
 * completo de free-exercise-db (dominio publico, Unlicense) y lo mapea a la
 * tabla `ejercicios_catalogo` de GFIT (ver migracion
 * supabase/migrations/20260719000000_gfit_schema.sql), con equipo/patron
 * mapeados a los slugs de `gfit_taxonomia` (ver migracion
 * supabase/migrations/20260719000100_gfit_taxonomia.sql).
 *
 * Uso (desde apps/web/):
 *   node scripts/seed-gfit-ejercicios.mjs --dry
 *     -> descarga + mapea + imprime estadisticas, NO escribe en Supabase.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/seed-gfit-ejercicios.mjs
 *     -> descarga + mapea + upsert por lotes de 100 (onConflict slug).
 *
 * Si no se exportan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el shell, el
 * script intenta leerlas de apps/web/.env (parser minimo, sin dependencia
 * dotenv nueva) SOLO si no vienen ya en process.env.
 *
 * NO ejecutar contra la base de datos ni aplicar migraciones desde aqui: el
 * orquestador de la oleada GFIT controla ese paso.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Constantes de la fuente (free-exercise-db)
// ---------------------------------------------------------------------------

const EXERCISES_JSON_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGES_BASE_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const BATCH_SIZE = 100;

// ---------------------------------------------------------------------------
// Carga minima de apps/web/.env (sin agregar dependencia dotenv)
// ---------------------------------------------------------------------------

function cargarDotEnvSiFalta() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const envPath = path.resolve(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;

  const contenido = readFileSync(envPath, 'utf8');
  for (const linea of contenido.split(/\r?\n/)) {
    const l = linea.trim();
    if (!l || l.startsWith('#')) continue;
    const idx = l.indexOf('=');
    if (idx === -1) continue;
    const clave = l.slice(0, idx).trim();
    let valor = l.slice(idx + 1).trim();
    // Quita comillas envolventes si las hay.
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (!(clave in process.env) && valor) {
      process.env[clave] = valor;
    }
  }
}

// ---------------------------------------------------------------------------
// Mapeo de equipo (free-exercise-db `equipment` -> slug de gfit_taxonomia tipo='equipo')
// ---------------------------------------------------------------------------

const EQUIPO_MAP = {
  barbell: 'barbell',
  dumbbell: 'dumbbells',
  'body only': 'bodyweight',
  machine: 'other-machines',
  cable: 'cable-station',
  kettlebells: 'kettlebells',
  'e-z curl bar': 'ez-bar',
  bands: 'tube-band',
  'medicine ball': 'medicine-ball',
  'exercise ball': 'stability-ball',
  'foam roll': 'foam-roller',
  other: 'other',
};
// null/undefined/valores desconocidos caen en 'other'.

function mapearEquipo(valorCrudo, unmapeados) {
  if (valorCrudo === null || valorCrudo === undefined) return 'other';
  const key = String(valorCrudo).trim().toLowerCase();
  if (key in EQUIPO_MAP) return EQUIPO_MAP[key];
  unmapeados.add(valorCrudo === '' ? '(vacio)' : valorCrudo);
  return 'other';
}

// ---------------------------------------------------------------------------
// Mapeo de musculos (free-exercise-db `primaryMuscles`/`secondaryMuscles` ->
// { grupo, sub } segun gfit_taxonomia tipo='grupo_muscular' / 'sub_musculo')
// ---------------------------------------------------------------------------

const MUSCULO_MAP = {
  abdominals: { grupo: 'abs', sub: null },
  lats: { grupo: 'back', sub: 'lats' },
  'lower back': { grupo: 'back', sub: 'lower-back' },
  'middle back': { grupo: 'back', sub: 'middle-back' },
  traps: { grupo: 'back', sub: 'traps' },
  biceps: { grupo: 'biceps', sub: null },
  forearms: { grupo: 'forearms', sub: null },
  chest: { grupo: 'chest', sub: null },
  glutes: { grupo: 'glutes', sub: null },
  shoulders: { grupo: 'shoulders', sub: null },
  triceps: { grupo: 'triceps', sub: null },
  hamstrings: { grupo: 'upper-leg', sub: 'hamstrings' },
  quadriceps: { grupo: 'upper-leg', sub: 'quads' },
  abductors: { grupo: 'upper-leg', sub: 'outer-thigh' },
  adductors: { grupo: 'upper-leg', sub: 'inner-thigh' },
  calves: { grupo: 'lower-leg', sub: 'upper-calf' },
  neck: { grupo: 'back', sub: 'traps' },
};

function mapearMusculo(nombreCrudo, unmapeados) {
  const key = String(nombreCrudo).trim().toLowerCase();
  if (key in MUSCULO_MAP) return MUSCULO_MAP[key];
  unmapeados.add(nombreCrudo);
  return null;
}

function mapearListaMusculos(lista, unmapeados) {
  const salida = [];
  for (const m of lista ?? []) {
    const mapeado = mapearMusculo(m, unmapeados);
    if (mapeado) salida.push(mapeado);
  }
  return salida;
}

// ---------------------------------------------------------------------------
// Heuristica de patron (slugs de gfit_taxonomia tipo='patron', 22 validos).
// Prioridad: mas especifico primero; retorna null si es ambiguo.
// ---------------------------------------------------------------------------

function inferirPatron(nombreEn, categoria, primarios, secundarios) {
  const musculosTexto = [...primarios, ...secundarios].join(' ').toLowerCase();
  const t = `${nombreEn} ${categoria ?? ''}`.toLowerCase();
  const tiene = (...claves) => claves.some((c) => t.includes(c));

  // 1. Loaded carry.
  if (tiene('carry', 'farmer', 'yoke walk', 'suitcase carry')) return 'loaded-carry';

  // 2. Hinge (bisagra de cadera, dominante compuesto).
  if (
    tiene(
      'deadlift',
      'good morning',
      'romanian',
      'stiff leg',
      'stiff-leg',
      'sumo deadlift',
      'kettlebell swing',
      'rdl',
    )
  )
    return 'hinge';

  // 3. Glute isolation (no bisagra, no sentadilla).
  if (tiene('hip thrust', 'glute bridge', 'donkey kick', 'glute kickback')) return 'glute-isolation';

  // 4. Squat/lunge.
  if (
    tiene(
      'squat',
      'lunge',
      'split squat',
      'step up',
      'step-up',
      'pistol',
      'leg press',
    )
  )
    return 'squat-lunge';

  // 5. Knee extension (aislamiento de cuadriceps via maquina).
  if (tiene('leg extension')) return 'knee-extension';

  // 6. Vertical pull.
  if (
    tiene('pull up', 'pull-up', 'pullup', 'chin up', 'chin-up', 'pulldown', 'lat pulldown')
  )
    return 'vertical-pull';

  // 7. Horizontal pull.
  if (tiene('row', 'face pull')) return 'horizontal-pull';

  // 8. Vertical push.
  if (
    tiene(
      'overhead press',
      'shoulder press',
      'military press',
      'push press',
      'arnold press',
      'handstand push',
    )
  )
    return 'vertical-push';

  // 9. Horizontal push.
  if (
    tiene(
      'bench press',
      'push up',
      'push-up',
      'pushup',
      'chest press',
      'floor press',
      'dip',
    )
  )
    return 'horizontal-push';

  // 10. Chest isolation.
  if (tiene('fly', 'flye', 'crossover', 'pec deck', 'pullover')) return 'chest-isolation';

  // 11. Shoulder isolation / control escapular.
  if (
    tiene('lateral raise', 'front raise', 'rear delt', 'upright row', 'shrug')
  )
    return 'shoulder-isolation';

  // 12. Arm isolation (flexion/extension de codo).
  if (
    tiene(
      'curl',
      'tricep extension',
      'skull crusher',
      'kickback',
      'pushdown',
      'extension',
    ) &&
    !tiene('leg extension', 'hip extension', 'back extension')
  )
    return 'arm-isolation';

  // 13. Calf/ankle.
  if (tiene('calf')) return 'calf-ankle';

  // 14. Spinal flexion.
  if (
    tiene('crunch', 'sit up', 'sit-up', 'situp', 'v-up', 'toes to bar')
  )
    return 'spinal-flexion';

  // 15. Spinal extension.
  if (tiene('back extension', 'hyperextension', 'superman')) return 'spinal-extension';

  // 16. Anti-rotate.
  if (tiene('plank', 'pallof', 'dead bug', 'bird dog')) return 'anti-rotate';

  // 17. Rotate/twist.
  if (tiene('twist', 'wood chop', 'woodchopper')) return 'rotate-twist';

  // 18. Hip flexion (sesgo abdominal bajo).
  if (tiene('leg raise', 'knee raise', 'mountain climber')) return 'hip-flexion';

  // 19. Hip abduction/adduction.
  if (tiene('abduction', 'adduction', 'clamshell')) return 'hip-abduction-adduction';

  // 20. Locomotion.
  if (tiene('walk', 'sprint', 'run', 'march')) return 'locomotion';

  // 21. Forearm/wrist.
  if (tiene('wrist', 'forearm')) return 'forearm-wrist';

  // 22. Ambiguo: sin patron.
  return null;
}

// ---------------------------------------------------------------------------
// Slug
// ---------------------------------------------------------------------------

function slugify(idCrudo) {
  return String(idCrudo)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------------------------------------------------------------------------
// Mapeo de un ejercicio completo
// ---------------------------------------------------------------------------

function mapearEjercicio(raw, unmapeados) {
  const equipoSlug = mapearEquipo(raw.equipment, unmapeados.equipo);
  const primarios = mapearListaMusculos(raw.primaryMuscles, unmapeados.musculos);
  const secundarios = mapearListaMusculos(raw.secondaryMuscles, unmapeados.musculos);
  const patron = inferirPatron(raw.name, raw.category, raw.primaryMuscles ?? [], raw.secondaryMuscles ?? []);

  const imagenes = (raw.images ?? []).map((ruta) => `${IMAGES_BASE_URL}${ruta}`);

  return {
    slug: slugify(raw.id),
    nombre_en: raw.name,
    nombre_es: null,
    fuerza: raw.force ?? null,
    nivel: raw.level ?? null,
    mecanica: raw.mechanic ?? null,
    equipo: [equipoSlug],
    patron,
    musculos_primarios: primarios,
    musculos_secundarios: secundarios,
    categoria: raw.category ?? null,
    instrucciones_en: raw.instructions ?? [],
    instrucciones_es: [],
    imagenes,
    source: 'free-exercise-db',
  };
}

// ---------------------------------------------------------------------------
// Descarga
// ---------------------------------------------------------------------------

async function descargarExercisesJson() {
  const resp = await fetch(EXERCISES_JSON_URL);
  if (!resp.ok) {
    throw new Error(`No se pudo descargar exercises.json: HTTP ${resp.status}`);
  }
  const json = await resp.json();
  if (!Array.isArray(json)) {
    throw new Error('exercises.json no tiene la forma esperada (array).');
  }
  return json;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dryRun = process.argv.includes('--dry');

  console.log('Descargando free-exercise-db (dist/exercises.json)...');
  const crudos = await descargarExercisesJson();
  console.log(`Ejercicios en la fuente: ${crudos.length}.`);

  const unmapeados = { equipo: new Set(), musculos: new Set() };
  const mapeados = crudos.map((raw) => mapearEjercicio(raw, unmapeados));

  const conPatron = mapeados.filter((e) => e.patron !== null).length;
  const sinPatron = mapeados.length - conPatron;

  console.log('---------------------------------------------');
  console.log(`Total mapeados: ${mapeados.length}`);
  console.log(
    `Con patron asignado: ${conPatron} (${((conPatron / mapeados.length) * 100).toFixed(1)}%)`,
  );
  console.log(`Sin patron (null, ambiguo): ${sinPatron}`);
  console.log(
    `Valores de equipo sin mapear (cayeron en 'other'): ${
      unmapeados.equipo.size === 0 ? 'ninguno' : [...unmapeados.equipo].join(', ')
    }`,
  );
  console.log(
    `Valores de musculo sin mapear: ${
      unmapeados.musculos.size === 0 ? 'ninguno' : [...unmapeados.musculos].join(', ')
    }`,
  );
  console.log('---------------------------------------------');

  if (dryRun) {
    console.log('Modo --dry: no se escribe en Supabase.');
    return;
  }

  cargarDotEnvSiFalta();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      'Faltan variables de entorno. Se requieren SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ' +
        '(en el shell o en apps/web/.env).',
    );
    console.error(
      'Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-gfit-ejercicios.mjs',
    );
    process.exit(1);
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let insertados = 0;
  for (let i = 0; i < mapeados.length; i += BATCH_SIZE) {
    const lote = mapeados.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('ejercicios_catalogo')
      .upsert(lote, { onConflict: 'slug' });
    if (error) {
      console.error(`Error en lote ${i / BATCH_SIZE + 1}:`, error.message);
      process.exit(1);
      return;
    }
    insertados += lote.length;
    console.log(`Lote ${i / BATCH_SIZE + 1}: ${lote.length} ejercicios procesados (upsert).`);
  }

  console.log('---------------------------------------------');
  console.log(`Total procesados (insert/update por upsert): ${insertados}`);
  console.log('Seed completado.');
}

main().catch((err) => {
  console.error('Fallo inesperado:', err);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Atribucion de fuente
// ---------------------------------------------------------------------------
//
// Los datos de ejercicios provienen de free-exercise-db
// (https://github.com/yuhonas/free-exercise-db), distribuidos bajo licencia
// Unlicense (dominio publico). No requiere atribucion legal, se deja esta
// nota por trazabilidad.
