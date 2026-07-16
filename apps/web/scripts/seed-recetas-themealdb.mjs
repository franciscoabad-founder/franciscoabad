/**
 * seed-recetas-themealdb.mjs
 *
 * Script Node ejecutable MANUALMENTE (NO en build) que descarga ~50 recetas de
 * TheMealDB (API gratuita v1, sin key) recorriendo las categorias y trayendo el
 * detalle completo de un puñado de platos por categoria, y las mapea a `recetas`
 * + `receta_ingredientes` (ver migracion supabase/migrations/20260720000000_nutricion_yazio.sql).
 *
 * Campos reales verificados en --dry (2026-07-15) via requests reales:
 *   - GET /categories.php -> categories[].strCategory
 *   - GET /filter.php?c=<categoria> -> meals[].idMeal
 *   - GET /lookup.php?i=<idMeal> -> meals[0] con strMeal, strInstructions,
 *     strMealThumb, strIngredient1..20 y strMeasure1..20 (vacios como '' o null
 *     cuando no aplican).
 *
 * TheMealDB v1 es la API de desarrollo gratuita y publica de themealdb.com
 * (sin autenticacion). No requiere licencia especial para uso no comercial de
 * datos de recetas segun su documentacion publica.
 *
 * Uso (desde apps/web/):
 *   node scripts/seed-recetas-themealdb.mjs --dry
 *     -> descarga + mapea + imprime estadisticas, NO escribe en Supabase.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/seed-recetas-themealdb.mjs
 *     -> descarga + mapea + upsert (onConflict fuente,nombre).
 *
 * NO ejecutar contra la base de datos ni aplicar migraciones desde aqui: el
 * orquestador de la oleada Nutricion controla ese paso.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const TOTAL_OBJETIVO = 50;
const POR_CATEGORIA = 5; // cuantos platos traer de cada categoria hasta llegar al total

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
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1);
    }
    if (!(clave in process.env) && valor) process.env[clave] = valor;
  }
}

// ---------------------------------------------------------------------------
// Descarga
// ---------------------------------------------------------------------------

async function obtenerCategorias() {
  const res = await fetch(`${BASE_URL}/categories.php`);
  if (!res.ok) throw new Error(`No se pudo descargar categories.php: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.categories)) throw new Error('categories.php no tiene la forma esperada.');
  return data.categories.map((c) => c.strCategory);
}

async function obtenerIdsPorCategoria(categoria) {
  const res = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(categoria)}`);
  if (!res.ok) throw new Error(`No se pudo descargar filter.php (${categoria}): HTTP ${res.status}`);
  const data = await res.json();
  return (data.meals ?? []).map((m) => m.idMeal);
}

async function obtenerDetalle(idMeal) {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${encodeURIComponent(idMeal)}`);
  if (!res.ok) throw new Error(`No se pudo descargar lookup.php (${idMeal}): HTTP ${res.status}`);
  const data = await res.json();
  return data.meals?.[0] ?? null;
}

// ---------------------------------------------------------------------------
// Mapeo
// ---------------------------------------------------------------------------

/** Extrae las 20 lineas de ingrediente+medida (strIngredientN/strMeasureN) de un meal. */
function extraerIngredientes(meal) {
  const lineas = [];
  for (let i = 1; i <= 20; i++) {
    const ingrediente = String(meal[`strIngredient${i}`] ?? '').trim();
    if (!ingrediente) continue;
    const medida = String(meal[`strMeasure${i}`] ?? '').trim();
    lineas.push(medida ? `${medida} ${ingrediente}` : ingrediente);
  }
  return lineas;
}

/** Divide strInstructions en pasos: por lineas si hay saltos, si no por oraciones. */
function extraerPasos(instrucciones) {
  const texto = String(instrucciones ?? '').trim();
  if (!texto) return [];
  const porLinea = texto.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean);
  if (porLinea.length > 1) return porLinea;
  // Instrucciones en un solo parrafo: separa por oracion (punto seguido de mayuscula/espacio).
  return texto.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter(Boolean);
}

function mapearMeal(meal) {
  return {
    receta: {
      nombre: String(meal.strMeal ?? '').trim(),
      descripcion: null,
      porciones: 1,
      tiempo_min: null,
      instrucciones: extraerPasos(meal.strInstructions),
      foto_url: meal.strMealThumb || null,
      fuente: 'themealdb',
      fuente_url: meal.strSource || meal.strYoutube || null,
      kcal: null,
      proteina_g: null,
      carbos_g: null,
      grasa_g: null,
      tags: meal.strTags ? meal.strTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    },
    ingredientes: extraerIngredientes(meal),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dryRun = process.argv.includes('--dry');

  console.log('Descargando categorias de TheMealDB...');
  const categorias = await obtenerCategorias();
  console.log(`Categorias encontradas: ${categorias.length} (${categorias.slice(0, 5).join(', ')}, ...)`);

  const idsRecolectados = [];
  for (const categoria of categorias) {
    if (idsRecolectados.length >= TOTAL_OBJETIVO) break;
    const ids = await obtenerIdsPorCategoria(categoria);
    idsRecolectados.push(...ids.slice(0, POR_CATEGORIA));
  }
  const idsFinales = idsRecolectados.slice(0, TOTAL_OBJETIVO);
  console.log(`IDs recolectados (antes de duplicados): ${idsRecolectados.length}. Usando: ${idsFinales.length}.`);

  const detalles = [];
  for (const id of idsFinales) {
    const meal = await obtenerDetalle(id);
    if (meal) detalles.push(meal);
  }

  const mapeadas = detalles.map(mapearMeal).filter((m) => m.receta.nombre);
  const sinIngredientes = mapeadas.filter((m) => m.ingredientes.length === 0).length;
  const sinPasos = mapeadas.filter((m) => m.receta.instrucciones.length === 0).length;
  const camposPrimerMeal = detalles[0] ? Object.keys(detalles[0]).slice(0, 10).join(', ') : '(sin datos)';

  console.log('---------------------------------------------');
  console.log(`Campos encontrados en el primer meal (muestra): ${camposPrimerMeal}, ...`);
  console.log(`Recetas mapeadas: ${mapeadas.length}`);
  console.log(`Sin ingredientes parseados: ${sinIngredientes}`);
  console.log(`Sin pasos parseados: ${sinPasos}`);
  console.log('---------------------------------------------');

  if (dryRun) {
    console.log('Modo --dry: no se escribe en Supabase.');
    console.log('Ejemplo mapeado (primera receta):', JSON.stringify(mapeadas[0], null, 2));
    return;
  }

  cargarDotEnvSiFalta();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Faltan variables de entorno. Se requieren SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
    console.error('Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-recetas-themealdb.mjs');
    process.exit(1);
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: recetasGuardadas, error } = await supabase
    .from('recetas')
    .upsert(mapeadas.map((m) => m.receta), { onConflict: 'fuente,nombre' })
    .select('id, nombre');
  if (error) {
    console.error('Error insertando recetas:', error.message);
    process.exit(1);
    return;
  }

  let ingredientesInsertados = 0;
  for (let i = 0; i < mapeadas.length; i++) {
    const receta = recetasGuardadas[i];
    const ingredientes = mapeadas[i].ingredientes;
    if (!receta || !ingredientes.length) continue;
    const { error: errDel } = await supabase.from('receta_ingredientes').delete().eq('receta_id', receta.id);
    if (errDel) {
      console.error(`Error limpiando ingredientes de "${receta.nombre}":`, errDel.message);
      continue;
    }
    const filas = ingredientes.map((descripcion, orden) => ({ receta_id: receta.id, orden, descripcion }));
    const { error: errIns } = await supabase.from('receta_ingredientes').insert(filas);
    if (errIns) {
      console.error(`Error insertando ingredientes de "${receta.nombre}":`, errIns.message);
      continue;
    }
    ingredientesInsertados += filas.length;
  }

  console.log('---------------------------------------------');
  console.log(`Recetas procesadas (upsert): ${recetasGuardadas.length}`);
  console.log(`Lineas de ingredientes insertadas: ${ingredientesInsertados}`);
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
// Los datos provienen de TheMealDB (https://www.themealdb.com), API de
// desarrollo v1 gratuita y publica (sin autenticacion).
