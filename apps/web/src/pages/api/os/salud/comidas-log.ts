export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../../lib/supabase';
import { isOsAuthorized, json } from '../../../../os/lib/osAuth';
import { errMsg, numOrNull, hoyGuayaquil, isExternalTokenAuthorized } from '../../../../lib/salud/apiHelpers';
import { calcularMacros, sumarMacros } from '../../../../lib/salud/macros';

const MOMENTOS = ['desayuno', 'almuerzo', 'cena', 'snack'];
const TIPOS_DIA = ['normal', 'leg_day', 'refeed', 'keto_light', 'keto'];
const SOURCES = ['manual', 'telegram', 'agente'];

// Resuelve los macros de una entrada: por alimento_id + cantidad_g, o directos.
async function resolverMacros(body: Record<string, unknown>) {
  const cantidad = numOrNull(body.cantidad_g);
  if (body.alimento_id && cantidad != null) {
    const sb = getSupabaseServer();
    const { data: alimento, error } = await sb
      .from('alimentos')
      .select('kcal,proteina_g,carbos_g,grasa_g,fibra_g')
      .eq('id', body.alimento_id)
      .single();
    if (error) throw error;
    return calcularMacros(alimento, cantidad);
  }
  // Macros directos (descripcion_libre o captura externa con macros ya estimados).
  return {
    kcal: numOrNull(body.kcal),
    proteina_g: numOrNull(body.proteina_g),
    carbos_g: numOrNull(body.carbos_g),
    grasa_g: numOrNull(body.grasa_g),
    fibra_g: numOrNull(body.fibra_g),
  };
}

export const GET: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const { url } = context;
  try {
    const sb = getSupabaseServer();

    // Historial: agrupado por fecha con totales.
    if (url.searchParams.get('historial') === '1') {
      const desde = url.searchParams.get('desde');
      let q = sb.from('comidas_log').select('*').order('fecha', { ascending: false });
      if (desde) q = q.gte('fecha', desde);
      const { data, error } = await q;
      if (error) throw error;
      return json({ comidas: data ?? [] });
    }

    const dia = url.searchParams.get('dia') || hoyGuayaquil();
    const { data, error } = await sb
      .from('comidas_log')
      .select('*')
      .eq('fecha', dia)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const entradas = data ?? [];
    const totales = sumarMacros(entradas);
    const tipo_dia = entradas.find((e) => e.tipo_dia)?.tipo_dia || 'normal';
    return json({ dia, comidas: entradas, totales, tipo_dia });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const POST: APIRoute = async (context) => {
  // Escritura externa (telegram/agente) permitida vía X-OS-Token; UI usa os_auth.
  if (!isOsAuthorized(context) && !isExternalTokenAuthorized(context)) {
    return json({ error: 'Unauthorized' }, 401);
  }
  try {
    const body = await context.request.json();
    const momento = body.momento?.trim() || 'snack';
    if (!MOMENTOS.includes(momento)) {
      return json({ error: `momento debe ser uno de: ${MOMENTOS.join(', ')}` }, 400);
    }
    const hayMacro = ['kcal', 'proteina_g', 'carbos_g', 'grasa_g'].some((k) => numOrNull(body[k]) != null);
    if (!body.alimento_id && !body.descripcion_libre?.trim() && !hayMacro) {
      return json({ error: 'alimento_id, descripcion_libre o macros requeridos' }, 400);
    }
    const tipo_dia = body.tipo_dia?.trim() || 'normal';
    if (!TIPOS_DIA.includes(tipo_dia)) {
      return json({ error: `tipo_dia inválido` }, 400);
    }
    const source = body.source?.trim() || 'manual';
    if (!SOURCES.includes(source)) return json({ error: 'source inválido' }, 400);

    const macros = await resolverMacros(body);
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('comidas_log')
      .insert([{
        fecha: body.fecha?.trim() || hoyGuayaquil(),
        momento,
        alimento_id: body.alimento_id || null,
        descripcion_libre: body.descripcion_libre?.trim() || null,
        cantidad_g: numOrNull(body.cantidad_g),
        kcal: macros.kcal,
        proteina_g: macros.proteina_g,
        carbos_g: macros.carbos_g,
        grasa_g: macros.grasa_g,
        fibra_g: macros.fibra_g,
        foto_url: body.foto_url?.trim() || null,
        source,
        tipo_dia,
        notas: body.notas?.trim() || null,
      }])
      .select()
      .single();
    if (error) throw error;
    return json({ comida: data }, 201);
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const PATCH: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const id = context.url.searchParams.get('id');
  if (!id) return json({ error: 'id requerido' }, 400);
  try {
    const body = await context.request.json();
    if ('momento' in body && !MOMENTOS.includes(body.momento?.trim())) {
      return json({ error: `momento debe ser uno de: ${MOMENTOS.join(', ')}` }, 400);
    }
    if ('tipo_dia' in body && !TIPOS_DIA.includes(body.tipo_dia?.trim())) {
      return json({ error: 'tipo_dia inválido' }, 400);
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    // Si cambia alimento/cantidad, recalcular macros SOLO cuando hay alimento referenciado.
    // Se reobtiene el alimento_id y la cantidad actuales de la fila para no perderlos al editar
    // solo uno de los dos. Sin alimento (entrada libre) NO se tocan los macros salvo override.
    let recalculado = false;
    if ('alimento_id' in body || 'cantidad_g' in body) {
      const sbCur = getSupabaseServer();
      const { data: actual } = await sbCur
        .from('comidas_log').select('alimento_id, cantidad_g').eq('id', id).single();
      const alimentoId = 'alimento_id' in body ? (body.alimento_id || null) : (actual?.alimento_id ?? null);
      const cantidad = 'cantidad_g' in body ? numOrNull(body.cantidad_g) : numOrNull(actual?.cantidad_g);
      if ('alimento_id' in body) patch.alimento_id = alimentoId;
      if ('cantidad_g' in body) patch.cantidad_g = cantidad;
      if (alimentoId != null && cantidad != null) {
        Object.assign(patch, await resolverMacros({ alimento_id: alimentoId, cantidad_g: cantidad }));
        recalculado = true;
      }
    }
    for (const c of ['momento', 'descripcion_libre', 'foto_url', 'tipo_dia', 'notas', 'fecha']) {
      if (c in body) patch[c] = typeof body[c] === 'string' ? body[c].trim() || null : body[c];
    }
    // Override manual de macros cuando no hubo recálculo por alimento (entrada libre).
    if (!recalculado) {
      for (const c of ['kcal', 'proteina_g', 'carbos_g', 'grasa_g', 'fibra_g']) {
        if (c in body) patch[c] = numOrNull(body[c]);
      }
    }
    const sb = getSupabaseServer();
    const { data, error } = await sb.from('comidas_log').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return json({ comida: data });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const DELETE: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const id = context.url.searchParams.get('id');
  if (!id) return json({ error: 'id requerido' }, 400);
  try {
    const sb = getSupabaseServer();
    const { error } = await sb.from('comidas_log').delete().eq('id', id);
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};
