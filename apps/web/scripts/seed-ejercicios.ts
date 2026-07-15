/**
 * seed-ejercicios.ts
 *
 * Script Node ejecutable MANUALMENTE (NO en build) que importa ejercicios desde
 * la API publica de wger (https://wger.de/api/v2/) y los inserta en Supabase de
 * forma idempotente.
 *
 * Uso (desde apps/web/):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node --experimental-strip-types scripts/seed-ejercicios.ts
 *
 * A diferencia de seed-alimentos.ts, este script SI hace llamadas de red en
 * runtime para obtener los datos desde wger. Nada de esto ocurre en el build.
 */

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Constantes de wger
// ---------------------------------------------------------------------------

const WGER_BASE = 'https://wger.de/api/v2/';
const WGER_HEADERS = { 'User-Agent': 'PanchoOS/1.0 (salud-os seed)' };

// wger language ids: 4 = espanol, 2 = ingles.
const LANG_ES = 4;
const LANG_EN = 2;

// Cuantos ejercicios como maximo recorrer/insertar.
const MAX_EJERCICIOS = 200;
const PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type Patron =
  | 'push_h'
  | 'push_v'
  | 'pull_h'
  | 'pull_v'
  | 'squat'
  | 'hinge'
  | 'core'
  | 'otro';

interface WgerMuscle {
  id: number;
  name: string;
  name_en: string;
}

interface WgerEquipment {
  id: number;
  name: string;
}

interface WgerCategory {
  id: number;
  name: string;
}

interface WgerImage {
  id: number;
  image: string;
}

interface WgerTranslation {
  language: number;
  name: string;
  description: string;
}

interface WgerExerciseInfo {
  id: number;
  category: WgerCategory | null;
  muscles: WgerMuscle[];
  muscles_secondary: WgerMuscle[];
  equipment: WgerEquipment[];
  images: WgerImage[];
  translations: WgerTranslation[];
}

interface WgerPage {
  count: number;
  next: string | null;
  results: WgerExerciseInfo[];
}

interface Ejercicio {
  nombre: string;
  nombre_en: string | null;
  grupo_muscular_primario: string | null;
  secundarios: string[];
  patron: Patron;
  equipamiento: string;
  instrucciones: string;
  media_url: string | null;
  fuente: string;
  wger_id: number;
}

// ---------------------------------------------------------------------------
// Mapeos y helpers
// ---------------------------------------------------------------------------

// wger categories (en ingles) a grupo muscular en espanol.
const CATEGORIA_ES: Record<string, string> = {
  Arms: 'Brazos',
  Legs: 'Piernas',
  Abs: 'Core',
  Chest: 'Pecho',
  Back: 'Espalda',
  Shoulders: 'Hombros',
  Calves: 'Pantorrillas',
};

function limpiarHtml(texto: string): string {
  return texto
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function traduccion(info: WgerExerciseInfo, lang: number): WgerTranslation | null {
  for (const t of info.translations) {
    if (t.language === lang && t.name && t.name.trim().length > 0) {
      return t;
    }
  }
  return null;
}

function nombreMusculo(m: WgerMuscle): string {
  const es = m.name && m.name.trim().length > 0 ? m.name.trim() : '';
  if (es) return es;
  return m.name_en ? m.name_en.trim() : '';
}

/**
 * Infiere el patron de movimiento a partir de palabras clave en el nombre, la
 * categoria y los musculos. Devuelve uno de los 8 patrones validos.
 *
 * Prioridad de heuristica (de mas especifica a mas general):
 *   1. hinge  -> peso muerto, hip thrust, bisagra de cadera, buenos dias
 *   2. squat  -> sentadilla, squat, zancada, prensa de pierna
 *   3. pull_v -> dominada, jalon al pecho, pull up, lat pulldown
 *   4. pull_h -> remo, jalon horizontal, face pull
 *   5. push_v -> press militar, press de hombro, elevacion, overhead
 *   6. push_h -> press de banca, flexion, fondos, aperturas de pecho
 *   7. core   -> abdominal, plancha, crunch, core, oblicuos
 *   8. otro   -> todo lo demas (aislamientos de brazo, pantorrilla, etc.)
 */
function inferirPatron(nombre: string, categoria: string, musculos: string): Patron {
  const t = `${nombre} ${categoria} ${musculos}`.toLowerCase();

  const tiene = (...claves: string[]): boolean => claves.some((c) => t.includes(c));

  // 1. Hinge (bisagra de cadera).
  if (
    tiene('peso muerto', 'deadlift', 'hip thrust', 'empuje de cadera', 'bisagra', 'good morning', 'buenos dias', 'hinge', 'romanian', 'rumano', 'glute bridge', 'puente de gluteo', 'swing')
  ) {
    return 'hinge';
  }

  // 2. Squat (dominante de rodilla).
  if (
    tiene('sentadilla', 'squat', 'zancada', 'lunge', 'desplante', 'prensa', 'leg press', 'step up', 'subida al cajon', 'estocada')
  ) {
    return 'squat';
  }

  // 3. Pull vertical.
  if (
    tiene('dominada', 'dominadas', 'pull up', 'pull-up', 'pullup', 'chin up', 'jalon al pecho', 'jalon dorsal', 'lat pulldown', 'pulldown', 'jalon vertical')
  ) {
    return 'pull_v';
  }

  // 4. Pull horizontal.
  if (
    tiene('remo', 'row', 'jalon horizontal', 'face pull', 'tiron', 'pull horizontal')
  ) {
    return 'pull_h';
  }

  // 5. Push vertical.
  if (
    tiene('press militar', 'press de hombro', 'press por encima', 'overhead press', 'shoulder press', 'military press', 'elevacion', 'elevaciones', 'lateral raise', 'front raise', 'arnold', 'push press')
  ) {
    return 'push_v';
  }

  // 6. Push horizontal.
  if (
    tiene('press de banca', 'press banca', 'bench press', 'press plano', 'press inclinado', 'press declinado', 'flexion', 'flexiones', 'push up', 'push-up', 'pushup', 'fondos', 'dips', 'apertura', 'aperturas', 'fly', 'pec deck', 'chest press', 'press de pecho')
  ) {
    return 'push_h';
  }

  // 7. Core.
  if (
    tiene('abdominal', 'abdominales', 'plancha', 'plank', 'crunch', 'core', 'oblicuo', 'oblicuos', 'sit up', 'sit-up', 'situp', 'elevacion de piernas', 'leg raise', 'russian twist', 'rueda abdominal', 'ab wheel', 'hollow', 'dead bug', 'mountain climber')
  ) {
    return 'core';
  }

  return 'otro';
}

// ---------------------------------------------------------------------------
// Descarga desde wger
// ---------------------------------------------------------------------------

async function traerPagina(offset: number): Promise<WgerPage | null> {
  const url = `${WGER_BASE}exerciseinfo/?limit=${PAGE_SIZE}&offset=${offset}`;
  try {
    const resp = await fetch(url, { headers: WGER_HEADERS });
    if (!resp.ok) {
      console.warn(`Pagina offset=${offset} devolvio HTTP ${resp.status}. Se omite.`);
      return null;
    }
    const json = await resp.json();
    return json as WgerPage;
  } catch (err) {
    console.warn(`Fallo de red en pagina offset=${offset}:`, err);
    return null;
  }
}

/**
 * Transforma un exerciseinfo de wger en nuestro modelo Ejercicio.
 * Devuelve null si el ejercicio no tiene nombre valido ni categoria.
 */
function mapearEjercicio(info: WgerExerciseInfo): Ejercicio | null {
  const tEs = traduccion(info, LANG_ES);
  const tEn = traduccion(info, LANG_EN);

  // Nombre: espanol con fallback a ingles.
  const tradNombre = tEs ?? tEn;
  if (!tradNombre) {
    return null;
  }
  const nombre = tradNombre.name.trim();
  if (!nombre) {
    return null;
  }

  // Requiere categoria para ubicar el grupo muscular.
  if (!info.category) {
    return null;
  }

  const nombre_en = tEn ? tEn.name.trim() : null;

  // Grupo muscular primario: sale de la categoria; se refina con el primer
  // musculo primario si esta disponible.
  const catName = info.category.name ? info.category.name.trim() : '';
  let grupo: string | null = CATEGORIA_ES[catName] ?? (catName || null);
  if (info.muscles && info.muscles.length > 0) {
    const refinado = nombreMusculo(info.muscles[0]);
    if (refinado) {
      grupo = grupo ? `${grupo} (${refinado})` : refinado;
    }
  }

  // Secundarios.
  const secundarios: string[] = [];
  for (const m of info.muscles_secondary ?? []) {
    const nm = nombreMusculo(m);
    if (nm) secundarios.push(nm);
  }

  // Equipamiento.
  const equipos: string[] = [];
  for (const e of info.equipment ?? []) {
    if (e.name && e.name.trim().length > 0) equipos.push(e.name.trim());
  }
  const equipamiento = equipos.length > 0 ? equipos.join(', ') : 'Ninguno';

  // Instrucciones: description de la traduccion elegida, sin tags HTML.
  const descRaw = tradNombre.description ? tradNombre.description : '';
  const instrucciones = limpiarHtml(descRaw);

  // Media: primera imagen si existe.
  let media_url: string | null = null;
  if (info.images && info.images.length > 0 && info.images[0].image) {
    media_url = info.images[0].image;
  }

  // Patron por heuristica.
  const musculosTexto = [...info.muscles.map(nombreMusculo), ...secundarios].join(' ');
  const patron = inferirPatron(nombre, catName, musculosTexto);

  return {
    nombre,
    nombre_en,
    grupo_muscular_primario: grupo,
    secundarios,
    patron,
    equipamiento,
    instrucciones,
    media_url,
    fuente: 'wger',
    wger_id: info.id,
  };
}

async function descargarEjercicios(): Promise<Ejercicio[]> {
  const ejercicios: Ejercicio[] = [];
  const vistos: Set<number> = new Set();
  let paginasFallidas = 0;
  let paginasIntentadas = 0;

  for (let offset = 0; offset < MAX_EJERCICIOS; offset += PAGE_SIZE) {
    paginasIntentadas += 1;
    const page = await traerPagina(offset);
    if (!page) {
      paginasFallidas += 1;
      continue;
    }
    if (!page.results || page.results.length === 0) {
      // No hay mas datos.
      break;
    }

    for (const info of page.results) {
      if (vistos.has(info.id)) continue;
      const ej = mapearEjercicio(info);
      if (!ej) continue;
      vistos.add(info.id);
      ejercicios.push(ej);
      if (ejercicios.length >= MAX_EJERCICIOS) break;
    }

    if (ejercicios.length >= MAX_EJERCICIOS) break;
    if (!page.next) break;
  }

  // Si TODAS las paginas fallaron, es un error total.
  if (paginasIntentadas > 0 && paginasFallidas === paginasIntentadas) {
    throw new Error('Todas las paginas de wger fallaron. Revisa la conexion de red.');
  }

  return ejercicios;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      'Faltan variables de entorno. Se requieren SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.',
    );
    console.error(
      'Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node --experimental-strip-types scripts/seed-ejercicios.ts',
    );
    process.exit(1);
    return;
  }

  console.log('Descargando ejercicios desde wger (https://wger.de/api/v2/) ...');
  const ejercicios: Ejercicio[] = await descargarEjercicios();
  console.log(`Ejercicios utiles obtenidos de wger: ${ejercicios.length}.`);

  if (ejercicios.length === 0) {
    console.error('No se obtuvo ningun ejercicio valido. Se aborta sin tocar Supabase.');
    process.exit(1);
    return;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  // 1. Traer los wger_id ya existentes para idempotencia.
  const existentes: Set<number> = new Set();
  const { data: filas, error: errSelect } = await supabase
    .from('ejercicios')
    .select('wger_id');

  if (errSelect) {
    console.error('Error consultando ejercicios existentes:', errSelect.message);
    process.exit(1);
    return;
  }

  if (filas) {
    for (const fila of filas) {
      if (fila.wger_id !== null && fila.wger_id !== undefined) {
        existentes.add(fila.wger_id);
      }
    }
  }

  // 2. Filtrar solo los que faltan (idempotencia por wger_id).
  const nuevos: Ejercicio[] = [];
  let yaExistian = 0;
  for (const ej of ejercicios) {
    if (existentes.has(ej.wger_id)) {
      yaExistian += 1;
    } else {
      nuevos.push(ej);
      // marcar para evitar duplicados internos del propio set
      existentes.add(ej.wger_id);
    }
  }

  // 3. Insertar los faltantes.
  let insertados = 0;
  if (nuevos.length > 0) {
    const { error: errInsert } = await supabase.from('ejercicios').insert(nuevos);
    if (errInsert) {
      console.error('Error insertando ejercicios:', errInsert.message);
      process.exit(1);
      return;
    }
    insertados = nuevos.length;
  }

  console.log('---------------------------------------------');
  console.log(`Insertados: ${insertados}`);
  console.log(`Ya existian: ${yaExistian}`);
  console.log(`Total procesados: ${ejercicios.length}`);
  console.log('---------------------------------------------');
  console.log('Seed completado.');
}

main().catch((err) => {
  console.error('Fallo inesperado:', err);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Atribucion de fuentes
// ---------------------------------------------------------------------------
//
// Los datos de ejercicios provienen de wger.de (Exercise database), consumidos
// en runtime desde su API publica (https://wger.de/api/v2/). El contenido de la
// base de datos de ejercicios de wger se distribuye bajo licencia
// Creative Commons CC-BY-SA 4.0 (y partes historicas bajo CC-BY-SA 3.0).
// Al reutilizar estos datos se debe mantener la atribucion a wger.de y conservar
// la misma licencia CC-BY-SA. Mas informacion: https://wger.de
