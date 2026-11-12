export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../../lib/supabase';
import { isOsAuthorized, json } from '../../../../os/lib/osAuth';
import { errMsg, isExternalTokenAuthorized } from '../../../../lib/salud/apiHelpers';
import {
  comidaANutritionLog,
  comidaAFitbitFoodLog,
  esEmpujable,
  type ComidaLog,
} from '../../../../lib/salud/nutricionOut';

// Cola de salida de nutricion (Supabase -> Google Health / Fitbit).
// Contrato completo en apps/web/docs/contrato-nutricion-out.md.
//
// El OS nunca llama a Google ni a Fitbit. Expone la cola por aqui y un flujo
// n8n la drena: GET para tomar pendientes, POST para acusar el resultado.
// Escribir hacia afuera de forma sincrona dentro del request del usuario haria
// que un fallo de Google rompa el registro de una comida, que es lo unico que
// de verdad importa guardar.

const DESTINOS = ['google_health', 'fitbit'];
const ESTADOS_ACUSE = ['enviado', 'error', 'omitido'];
const LIMITE_DEFAULT = 25;
const LIMITE_MAX = 100;
const MAX_INTENTOS = 5;

// Columnas de comidas_log que necesita el mapeo. Se piden explicitas para no
// arrastrar el resto de la fila hacia n8n.
const CAMPOS = [
  'id', 'fecha', 'momento', 'created_at', 'descripcion_libre', 'cantidad_g',
  'kcal', 'proteina_g', 'carbos_g', 'grasa_g', 'fibra_g',
  'azucares_g', 'saturada_g', 'monoinsaturada_g', 'poliinsaturada_g',
  'sodio_mg', 'colesterol_mg', 'source', 'sync_intentos',
  'alimentos(nombre)',
].join(',');

function autorizado(context: Parameters<APIRoute>[0]) {
  return isOsAuthorized(context) || isExternalTokenAuthorized(context);
}

/**
 * GET: pendientes listos para empujar, ya mapeados al formato del destino.
 * ?destino=google_health|fitbit (default google_health), ?limite=1..100.
 */
export const GET: APIRoute = async (context) => {
  if (!autorizado(context)) return json({ error: 'Unauthorized' }, 401);
  try {
    const { searchParams } = context.url;
    const destino = searchParams.get('destino') || 'google_health';
    if (!DESTINOS.includes(destino)) {
      return json({ error: `destino debe ser: ${DESTINOS.join(', ')}` }, 400);
    }
    const limiteRaw = Number(searchParams.get('limite') || LIMITE_DEFAULT);
    const limite = Number.isFinite(limiteRaw)
      ? Math.min(Math.max(Math.trunc(limiteRaw), 1), LIMITE_MAX)
      : LIMITE_DEFAULT;

    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('comidas_log')
      .select(CAMPOS)
      .eq('sync_estado', 'pendiente')
      .lt('sync_intentos', MAX_INTENTOS)
      .order('created_at', { ascending: true })
      .limit(limite);
    if (error) throw error;

    const filas = (data ?? []) as unknown as Array<ComidaLog & {
      sync_intentos?: number;
      alimentos?: { nombre?: string | null } | null;
    }>;

    // Un registro que nacio en Google o Fitbit no se devuelve al mismo sistema.
    // Se marca 'omitido' aqui mismo para que no quede girando en la cola.
    const empujables = filas.filter(esEmpujable);
    const bloqueados = filas.filter((f) => !esEmpujable(f));
    if (bloqueados.length) {
      await sb
        .from('comidas_log')
        .update({ sync_estado: 'omitido', sync_error: 'source externo: no se reenvia' })
        .in('id', bloqueados.map((f) => f.id));
    }

    const pendientes = empujables.map((fila) => {
      const comida: ComidaLog = { ...fila, alimento_nombre: fila.alimentos?.nombre ?? null };
      return {
        id: comida.id,
        fecha: comida.fecha,
        momento: comida.momento,
        intentos: fila.sync_intentos ?? 0,
        payload: destino === 'fitbit' ? comidaAFitbitFoodLog(comida) : comidaANutritionLog(comida),
      };
    });

    return json({ destino, pendientes, n: pendientes.length, omitidas: bloqueados.length });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

/**
 * POST: acuse de recibo de n8n. Acepta un item o { acuses: [...] }.
 * { id, estado: 'enviado'|'error'|'omitido', destino, external_id?, error?, raw? }
 */
export const POST: APIRoute = async (context) => {
  if (!autorizado(context)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await context.request.json();
    const items: Record<string, unknown>[] = Array.isArray(body?.acuses) ? body.acuses : [body];
    if (!items.length) return json({ error: 'acuses no puede estar vacío' }, 400);

    const sb = getSupabaseServer();
    const filas: unknown[] = [];

    for (const item of items) {
      const id = typeof item?.id === 'string' ? item.id.trim() : '';
      if (!id) return json({ error: 'id requerido' }, 400);
      const estado = typeof item?.estado === 'string' ? item.estado.trim() : '';
      if (!ESTADOS_ACUSE.includes(estado)) {
        return json({ error: `estado debe ser: ${ESTADOS_ACUSE.join(', ')}` }, 400);
      }
      const destino = typeof item?.destino === 'string' ? item.destino.trim() : 'google_health';
      if (!DESTINOS.includes(destino)) {
        return json({ error: `destino debe ser: ${DESTINOS.join(', ')}` }, 400);
      }
      if (estado === 'enviado' && !item?.external_id) {
        return json({ error: 'external_id requerido cuando estado es enviado' }, 400);
      }

      const patch: Record<string, unknown> = {
        sync_estado: estado,
        sync_destino: destino,
        sync_at: new Date().toISOString(),
        sync_error: estado === 'error' ? String(item?.error ?? 'error sin detalle').slice(0, 2000) : null,
        updated_at: new Date().toISOString(),
      };
      if (item?.external_id) patch.sync_external_id = String(item.external_id);
      if (item?.raw !== undefined && item.raw !== null) patch.sync_raw = item.raw;

      // Un error deja la fila en 'error' y suma un intento. El flujo la reintenta
      // devolviendola a 'pendiente' solo si el operador lo decide; el contador
      // evita que un payload invalido se reintente para siempre.
      if (estado === 'error') {
        const { data: actual } = await sb
          .from('comidas_log').select('sync_intentos').eq('id', id).maybeSingle();
        patch.sync_intentos = (actual?.sync_intentos ?? 0) + 1;
      }

      const { data, error } = await sb
        .from('comidas_log').update(patch).eq('id', id).select('id,sync_estado,sync_external_id,sync_intentos').single();
      if (error) throw error;
      filas.push(data);
    }

    return json({ acuses: filas, n: filas.length });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};
