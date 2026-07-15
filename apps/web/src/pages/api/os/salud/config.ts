export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../../lib/supabase';
import { isOsAuthorized, json } from '../../../../os/lib/osAuth';
import { errMsg } from '../../../../lib/salud/apiHelpers';

// Devuelve (y crea si no existe) la fila única de salud_config con los targets.
async function getConfig() {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from('salud_config')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1);
  if (error) throw error;
  if (data && data.length) return data[0];
  const { data: created, error: insErr } = await sb
    .from('salud_config')
    .insert([{}])
    .select()
    .single();
  if (insErr) throw insErr;
  return created;
}

export const GET: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  try {
    return json({ config: await getConfig() });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const PATCH: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await context.request.json();
    const current = await getConfig();
    const sb = getSupabaseServer();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const campos = [
      'kcal_min', 'kcal_max', 'proteina_g', 'carbos_g', 'grasa_g_min', 'grasa_g_max',
      'ajustes_tipo_dia', 'protocolo_ayuno_default', 'unidad_peso', 'preferencias',
    ];
    for (const c of campos) if (c in body) patch[c] = body[c];
    const { data, error } = await sb
      .from('salud_config')
      .update(patch)
      .eq('id', current.id)
      .select()
      .single();
    if (error) throw error;
    return json({ config: data });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};
