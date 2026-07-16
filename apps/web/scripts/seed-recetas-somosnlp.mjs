/**
 * seed-recetas-somosnlp.mjs
 *
 * Script Node ejecutable MANUALMENTE (NO en build) que descarga las primeras 200
 * recetas del dataset HuggingFace `somosnlp/recetas-cocina` via la API
 * datasets-server (sin necesidad de descargar el CSV completo ni de token de HF,
 * el dataset es publico) y las mapea a `recetas` + `receta_ingredientes`
 * (ver migracion supabase/migrations/20260720000000_nutricion_yazio.sql).
 *
 * Campos reales verificados en --dry (2026-07-15) via un request real a
 * datasets-server: title, url, ingredients (texto con lineas separadas por \r\n),
 * steps (texto con lineas separadas por \r\n), uuid. config=default, split=train,
 * num_rows_total=28238 al momento de escribir este script.
 *
 * Licencia verificada (2026-07-15) via https://huggingface.co/api/datasets/somosnlp/recetas-cocina:
 *   cardData.license = "mit" (tambien aparece el tag "license:mit"). MIT es
 *   permisiva: el script continua. Si en una corrida futura la licencia ya NO
 *   aparece como permisiva, el script aborta con una advertencia (ver
 *   LICENCIAS_PERMISIVAS abajo) en vez de asumir que sigue siendo segura.
 *
 * Uso (desde apps/web/):
 *   node scripts/seed-recetas-somosnlp.mjs --dry
 *     -> descarga + mapea + imprime estadisticas y la licencia, NO escribe en Supabase.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/seed-recetas-somosnlp.mjs
 *     -> descarga + mapea + upsert por lotes (onConflict fuente,nombre).
 *
 * NO ejecutar contra la base de datos ni aplicar migraciones desde aqui: el
 * orquestador de la oleada Nutricion controla ese paso.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATASET = 'somosnlp/recetas-cocina';
const DATASET_INFO_URL = `https://huggingface.co/api/datasets/${DATASET}`;
const ROWS_URL = (offset, length) =>
  `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(DATASET)}&config=default&split=train&offset=${offset}&length=${length}`;

const TOTAL_RECETAS = 200;
const PAGE_SIZE = 100; // maximo aceptado por datasets-server por pagina
const BATCH_SIZE = 100;

const LICENCIAS_PERMISIVAS = ['mit', 'cc0-1.0', 'cc-by-4.0', 'cc-by-sa-4.0', 'apache-2.0', 'unlicense'];

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
// Licencia
// ---------------------------------------------------------------------------

async function verificarLicencia() {
  const res = await fetch(DATASET_INFO_URL);
  if (!res.ok) throw new Error(`No se pudo consultar la licencia del dataset: HTTP ${res.status}`);
  const info = await res.json();
  const licencia = info?.cardData?.license || 'desconocida';
  console.log(`Licencia del dataset ${DATASET}: "${licencia}"`);
  const esPermisiva = LICENCIAS_PERMISIVAS.includes(String(licencia).toLowerCase());
  if (!esPermisiva) {
    console.warn(
      `ADVERTENCIA: la licencia "${licencia}" no esta en la lista de licencias permisivas conocidas ` +
        `(${LICENCIAS_PERMISIVAS.join(', ')}). Abortando por seguridad.`,
    );
  }
  return { licencia, esPermisiva };
}

// ---------------------------------------------------------------------------
// Descarga paginada via datasets-server
// ---------------------------------------------------------------------------

async function descargarFilas(total) {
  const filas = [];
  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    const length = Math.min(PAGE_SIZE, total - offset);
    const res = await fetch(ROWS_URL(offset, length));
    if (!res.ok) throw new Error(`No se pudo descargar filas (offset ${offset}): HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.rows)) throw new Error('Respuesta de datasets-server sin campo rows[].');
    for (const r of data.rows) filas.push(r.row);
    console.log(`Descargadas ${filas.length}/${total} filas (num_rows_total real: ${data.num_rows_total}).`);
  }
  return filas;
}

// ---------------------------------------------------------------------------
// Mapeo
// ---------------------------------------------------------------------------

function partirLineas(texto) {
  return String(texto ?? '')
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapearFila(fila) {
  const nombre = String(fila.title ?? '').trim();
  return {
    receta: {
      nombre,
      descripcion: null,
      porciones: 1,
      tiempo_min: null,
      instrucciones: partirLineas(fila.steps),
      foto_url: null,
      fuente: 'somosnlp',
      fuente_url: fila.url || null,
      kcal: null,
      proteina_g: null,
      carbos_g: null,
      grasa_g: null,
      tags: [],
    },
    ingredientes: partirLineas(fila.ingredients),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dryRun = process.argv.includes('--dry');

  const { licencia, esPermisiva } = await verificarLicencia();
  if (!esPermisiva) {
    process.exit(1);
    return;
  }

  console.log(`Descargando ${TOTAL_RECETAS} recetas de ${DATASET} (datasets-server)...`);
  const filas = await descargarFilas(TOTAL_RECETAS);

  const conNombre = filas
    .map(mapearFila)
    .filter((m) => m.receta.nombre); // descarta filas sin titulo

  // Dedupe por nombre normalizado (trim + lower) sobre TODO el set descargado antes
  // de armar lotes: el dataset trae titulos repetidos y dos filas con el mismo
  // (fuente, nombre) dentro de un mismo upsert rompen con "ON CONFLICT DO UPDATE
  // command cannot affect row a second time". Se conserva la primera aparicion.
  const vistos = new Set();
  const mapeadas = [];
  let duplicadasOmitidas = 0;
  for (const m of conNombre) {
    const clave = m.receta.nombre.trim().toLowerCase();
    if (vistos.has(clave)) {
      duplicadasOmitidas += 1;
      continue;
    }
    vistos.add(clave);
    mapeadas.push(m);
  }

  const sinIngredientes = mapeadas.filter((m) => m.ingredientes.length === 0).length;
  const sinPasos = mapeadas.filter((m) => m.receta.instrucciones.length === 0).length;

  console.log('---------------------------------------------');
  console.log(`Campos encontrados en la primera fila: ${Object.keys(filas[0] ?? {}).join(', ')}`);
  console.log(`Filas descargadas: ${filas.length}`);
  console.log(`Mapeadas con nombre valido: ${conNombre.length}`);
  console.log(`Duplicadas omitidas (mismo nombre normalizado): ${duplicadasOmitidas}`);
  console.log(`Unicas a procesar: ${mapeadas.length}`);
  console.log(`Sin ingredientes parseados: ${sinIngredientes}`);
  console.log(`Sin pasos parseados: ${sinPasos}`);
  console.log(`Licencia: ${licencia}`);
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
    console.error('Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-recetas-somosnlp.mjs');
    process.exit(1);
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let insertadas = 0;
  let lineasIngredientes = 0;
  for (let i = 0; i < mapeadas.length; i += BATCH_SIZE) {
    const lote = mapeadas.slice(i, i + BATCH_SIZE);
    const { data: recetasGuardadas, error } = await supabase
      .from('recetas')
      .upsert(lote.map((m) => m.receta), { onConflict: 'fuente,nombre' })
      .select('id, nombre');
    if (error) {
      console.error(`Error en lote ${i / BATCH_SIZE + 1} (recetas):`, error.message);
      process.exit(1);
      return;
    }

    // Reemplaza los ingredientes de cada receta del lote (idempotente: borra e inserta).
    for (let j = 0; j < lote.length; j++) {
      const receta = recetasGuardadas[j];
      const ingredientes = lote[j].ingredientes;
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
      lineasIngredientes += filas.length;
    }

    insertadas += lote.length;
    console.log(`Lote ${i / BATCH_SIZE + 1}: ${lote.length} recetas procesadas (upsert).`);
  }

  // Verificacion final: cuantas recetas somosnlp existen realmente en la base.
  const { count: totalEnDb, error: errCount } = await supabase
    .from('recetas')
    .select('id', { count: 'exact', head: true })
    .eq('fuente', 'somosnlp');
  if (errCount) console.error('Error en el conteo final:', errCount.message);

  console.log('---------------------------------------------');
  console.log(`Total procesado (insert/update por upsert): ${insertadas}`);
  console.log(`Lineas de ingredientes insertadas: ${lineasIngredientes}`);
  console.log(`Recetas fuente='somosnlp' en la base (conteo final): ${totalEnDb ?? 'error'}`);
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
// Los datos provienen del dataset HuggingFace somosnlp/recetas-cocina
// (https://huggingface.co/datasets/somosnlp/recetas-cocina), publicado bajo
// licencia MIT (verificada programaticamente en verificarLicencia() antes de
// cada corrida real).
